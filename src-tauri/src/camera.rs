use std::fs;
use std::io::{BufRead, BufReader, Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::PathBuf;
use std::process::{Child, ChildStdout, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;

use tauri::{AppHandle, Manager};

const CAMERA_DEVICE: &str = "/dev/video0";
const PROXY_ADDR: &str = "127.0.0.1:8008";

pub struct CameraState {
    pub process: Mutex<Option<Child>>,
    pub proxy_started: Mutex<bool>,
    pub stream: Arc<Mutex<Option<Arc<Mutex<ChildStdout>>>>>,
}

#[tauri::command]
pub fn save_photo(app: AppHandle, data: Vec<u8>) -> Result<String, String> {
    println!("Saving photo with {} bytes", data.len());

    let picture_dir = app
        .path()
        .picture_dir()
        .map_err(|e| format!("Could not find Pictures directory: {}", e))?;

    let camera_dir = picture_dir.join("home-dashboard");

    fs::create_dir_all(&camera_dir)
        .map_err(|e| format!("Could not create photo directory: {}", e))?;

    let timestamp = chrono::Local::now()
        .format("%Y-%m-%d_%H-%M-%S-%3f")
        .to_string();

    let file_path: PathBuf = camera_dir.join(format!("photo_{}.jpg", timestamp));

    fs::write(&file_path, data).map_err(|e| format!("Could not save photo: {}", e))?;

    println!("Photo saved at {:?}", file_path);

    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn start_camera_stream(state: tauri::State<'_, CameraState>) -> Result<String, String> {
    ensure_proxy_started(&state)?;

    let mut process = state
        .process
        .lock()
        .map_err(|_| "Could not lock camera state".to_string())?;

    // Already running?
    if let Some(child) = process.as_mut() {
        match child.try_wait() {
            Ok(None) => {
                return Ok(format!(
                    "Camera stream already running on http://{}",
                    PROXY_ADDR
                ));
            }

            Ok(Some(status)) => {
                println!("Previous FFmpeg process exited with {:?}", status);

                *process = None;

                let mut stream = state
                    .stream
                    .lock()
                    .map_err(|_| "Could not lock camera stream state".to_string())?;

                *stream = None;
            }

            Err(e) => {
                return Err(format!("Could not check camera process: {}", e));
            }
        }
    }

    if !std::path::Path::new(CAMERA_DEVICE).exists() {
        return Err(format!("Camera not found at {}", CAMERA_DEVICE));
    }

    println!("Starting FFmpeg...");

    let mut child = Command::new("ffmpeg")
        .args([
            "-f",
            "v4l2",
            "-input_format",
            "mjpeg",
            "-framerate",
            "30",
            "-video_size",
            "640x480",
            "-i",
            CAMERA_DEVICE,
            "-c:v",
            "copy",
            "-f",
            "mpjpeg",
            "pipe:1",
        ])
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|e| format!("Could not start FFmpeg: {}", e))?;

    let stdout = child
        .stdout
        .take()
        .ok_or_else(|| "Could not capture FFmpeg stdout".to_string())?;

    let stream = Arc::new(Mutex::new(stdout));

    {
        let mut stream_state = state
            .stream
            .lock()
            .map_err(|_| "Could not lock camera stream state".to_string())?;

        *stream_state = Some(stream);
    }

    *process = Some(child);

    println!("Camera stream started on http://{}", PROXY_ADDR);

    Ok(format!("Camera stream started on http://{}", PROXY_ADDR))
}

#[tauri::command]
pub fn stop_camera_stream(state: tauri::State<'_, CameraState>) -> Result<(), String> {
    stop_camera_process(&state)
}

pub fn stop_camera_process(state: &CameraState) -> Result<(), String> {
    let mut process = state
        .process
        .lock()
        .map_err(|_| "Could not lock camera state".to_string())?;

    if let Some(mut child) = process.take() {
        println!("Stopping FFmpeg...");

        let _ = child.kill();
        let _ = child.wait();

        println!("Camera stream stopped");
    }

    let mut stream = state
        .stream
        .lock()
        .map_err(|_| "Could not lock camera stream state".to_string())?;

    *stream = None;

    Ok(())
}

fn ensure_proxy_started(state: &CameraState) -> Result<(), String> {
    let mut started = state
        .proxy_started
        .lock()
        .map_err(|_| "Could not lock proxy state".to_string())?;

    if *started {
        return Ok(());
    }

    let listener = TcpListener::bind(PROXY_ADDR)
        .map_err(|e| format!("Could not bind camera proxy on {}: {}", PROXY_ADDR, e))?;

    let stream_state = Arc::clone(&state.stream);

    thread::spawn(move || {
        println!("Camera proxy listening on {}", PROXY_ADDR);

        for incoming in listener.incoming() {
            match incoming {
                Ok(client) => {
                    let stream_state = Arc::clone(&stream_state);

                    thread::spawn(move || {
                        proxy_client(client, stream_state);
                    });
                }

                Err(e) => {
                    eprintln!("Camera proxy connection error: {}", e);
                }
            }
        }
    });

    *started = true;

    Ok(())
}

fn proxy_client(client: TcpStream, stream_state: Arc<Mutex<Option<Arc<Mutex<ChildStdout>>>>>) {
    let mut client_reader = match client.try_clone() {
        Ok(clone) => BufReader::new(clone),
        Err(e) => {
            eprintln!("Could not clone client socket: {}", e);
            return;
        }
    };

    // Read HTTP request.
    let mut line = String::new();

    loop {
        line.clear();

        match client_reader.read_line(&mut line) {
            Ok(0) => return,

            Err(e) => {
                eprintln!("Error reading camera request: {}", e);
                return;
            }

            Ok(_) => {
                if line == "\r\n" || line == "\n" {
                    break;
                }
            }
        }
    }

    let stream = {
        let stream_guard = match stream_state.lock() {
            Ok(guard) => guard,

            Err(_) => {
                send_503(client);
                return;
            }
        };

        match stream_guard.as_ref() {
            Some(stream) => Arc::clone(stream),

            None => {
                send_503(client);
                return;
            }
        }
    };

    let mut client_writer = client;

    // HTTP response.
    let headers = b"HTTP/1.1 200 OK\r\n\
          Content-Type: multipart/x-mixed-replace; boundary=ffmpeg\r\n\
          Access-Control-Allow-Origin: *\r\n\
          Cache-Control: no-cache, no-store, must-revalidate\r\n\
          Pragma: no-cache\r\n\
          Connection: close\r\n\
          \r\n";

    if client_writer.write_all(headers).is_err() {
        return;
    }

    println!("Camera client connected");

    let mut buffer = [0u8; 8192];

    loop {
        let bytes_read = {
            let mut reader = match stream.lock() {
                Ok(reader) => reader,

                Err(_) => {
                    eprintln!("FFmpeg stdout lock poisoned");
                    return;
                }
            };

            match reader.read(&mut buffer) {
                Ok(0) => {
                    println!("FFmpeg stdout closed");
                    return;
                }

                Ok(n) => n,

                Err(e) => {
                    eprintln!("Error reading FFmpeg stdout: {}", e);
                    return;
                }
            }
        };

        if client_writer.write_all(&buffer[..bytes_read]).is_err() {
            println!("Camera client disconnected");
            return;
        }
    }
}

fn send_503(mut client: TcpStream) {
    let _ = client.write_all(
        b"HTTP/1.1 503 Service Unavailable\r\n\
          Content-Length: 0\r\n\
          Connection: close\r\n\
          \r\n",
    );
}
