use std::fs;
use std::io::{BufRead, BufReader, Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::PathBuf;
use std::process::{Child, Command};
use std::sync::Mutex;
use std::thread;

use tauri::{AppHandle, Manager};

// const CAMERA_DEVICE: &str =
//     "/dev/v4l/by-id/usb-Generic_USB_Camera_200901010001-video-index0";
const CAMERA_DEVICE: &str = "/dev/video0";

// ffmpeg listens internally on this address; it is never exposed to the WebView directly
// because its responses carry no CORS headers, which would leave the canvas tainted.
const FFMPEG_ADDR: &str = "127.0.0.1:8090";

// The WebView loads the stream from this address instead. A small local proxy forwards
// bytes from FFMPEG_ADDR and injects Access-Control-Allow-Origin so the <img> frame can
// be drawn onto a canvas (needed for photo capture) without tainting it.
const PROXY_ADDR: &str = "127.0.0.1:8008";

pub struct CameraState {
    pub process: Mutex<Option<Child>>,
    pub proxy_started: Mutex<bool>,
}

#[tauri::command]
pub fn save_photo(app: AppHandle, data: Vec<u8>) -> Result<String, String> {
    println!("Saving photo with {} bytes", data.len());
    println!("Starting to save photo...");
    let picture_dir = app
        .path()
        .picture_dir()
        .map_err(|e| format!("Could not find Pictures directory: {}", e))?;

    let camera_dir = picture_dir.join("home-dashboard");

    fs::create_dir_all(&camera_dir)
        .map_err(|e| format!("Could not create photo directory: {}", e))?;
    println!("Photo directory created at {:?}", camera_dir);

    let timestamp = chrono::Local::now()
        .format("%Y-%m-%d_%H-%M-%S-%3f")
        .to_string();

    let file_path: PathBuf =
        camera_dir.join(format!("photo_{}.jpg", timestamp));

    fs::write(&file_path, data)
        .map_err(|e| format!("Could not save photo: {}", e))?;
    println!("Photo saved at {:?}", file_path);

    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn start_camera_stream(
    state: tauri::State<'_, CameraState>,
) -> Result<String, String> {
    ensure_proxy_started(&state);

    let mut process = state
        .process
        .lock()
        .map_err(|_| "Could not lock camera state".to_string())?;

    // If FFmpeg is already running, don't start another instance.
    if let Some(child) = process.as_mut() {
        match child.try_wait() {
            Ok(None) => {
                return Ok(format!(
                    "Camera stream already running on http://{}",
                    PROXY_ADDR
                ));
            }
            Ok(Some(_)) => {
                *process = None;
            }
            Err(e) => {
                return Err(format!("Could not check camera process: {}", e));
            }
        }
    }

    if !std::path::Path::new(CAMERA_DEVICE).exists() {
        return Err(format!("Camera not found at {}", CAMERA_DEVICE));
    }

    let child = Command::new("ffmpeg")
        .args([
            "-f", "v4l2",
            "-input_format", "mjpeg",
            "-framerate", "30",
            "-video_size", "640x480",
            "-i", CAMERA_DEVICE,
            // Camera already outputs MJPEG. Do not decode/re-encode it.
            "-c:v", "copy",
            // HTTP multipart MJPEG stream.
            "-f", "mpjpeg",
            "-listen", "1",
            &format!("http://{}", FFMPEG_ADDR),
        ])
        .spawn()
        .map_err(|e| format!("Could not start FFmpeg: {}", e))?;

    *process = Some(child);

    println!("Camera stream started on http://{}", PROXY_ADDR);

    Ok(format!("Camera stream started on http://{}", PROXY_ADDR))
}

#[tauri::command]
pub fn stop_camera_stream(
    state: tauri::State<'_, CameraState>,
) -> Result<(), String> {
    stop_camera_process(&state)
}

pub fn stop_camera_process(state: &CameraState) -> Result<(), String> {
    let mut process = state
        .process
        .lock()
        .map_err(|_| "Could not lock camera state".to_string())?;

    if let Some(mut child) = process.take() {
        let _ = child.kill();
        let _ = child.wait();
        println!("Camera stream stopped");
    }

    Ok(())
}

fn ensure_proxy_started(state: &CameraState) {
    let mut started = match state.proxy_started.lock() {
        Ok(guard) => guard,
        Err(_) => return,
    };

    if *started {
        return;
    }

    let listener = match TcpListener::bind(PROXY_ADDR) {
        Ok(listener) => listener,
        Err(e) => {
            eprintln!("Could not bind camera proxy on {}: {}", PROXY_ADDR, e);
            return;
        }
    };

    thread::spawn(move || {
        for incoming in listener.incoming() {
            if let Ok(client) = incoming {
                thread::spawn(move || proxy_client(client));
            }
        }
    });

    *started = true;
}

// Relays the MJPEG stream from ffmpeg to a single WebView client, injecting a
// permissive CORS header so the frame can be captured onto a canvas.
fn proxy_client(client: TcpStream) {
    let upstream = match TcpStream::connect(FFMPEG_ADDR) {
        Ok(stream) => stream,
        Err(_) => {
            let _ = (&client).write_all(
                b"HTTP/1.1 502 Bad Gateway\r\nContent-Length: 0\r\nConnection: close\r\n\r\n",
            );
            return;
        }
    };

    // Drain the client's request before relaying anything upstream.
    let mut client_reader = BufReader::new(match client.try_clone() {
        Ok(clone) => clone,
        Err(_) => return,
    });
    let mut line = String::new();
    loop {
        line.clear();
        match client_reader.read_line(&mut line) {
            Ok(0) | Err(_) => break,
            Ok(_) => {
                if line == "\r\n" || line == "\n" {
                    break;
                }
            }
        }
    }

    let mut upstream_writer = match upstream.try_clone() {
        Ok(clone) => clone,
        Err(_) => return,
    };
    if upstream_writer.write_all(b"GET / HTTP/1.0\r\n\r\n").is_err() {
        return;
    }

    let mut upstream_reader = BufReader::new(upstream);
    let mut client_writer = client;

    // Relay ffmpeg's response headers, adding CORS support before the blank line.
    loop {
        let mut header_line = String::new();
        match upstream_reader.read_line(&mut header_line) {
            Ok(0) | Err(_) => return,
            Ok(_) => {}
        }

        if header_line == "\r\n" || header_line == "\n" {
            let _ = client_writer.write_all(b"Access-Control-Allow-Origin: *\r\n");
            let _ = client_writer.write_all(b"\r\n");
            break;
        }

        if client_writer.write_all(header_line.as_bytes()).is_err() {
            return;
        }
    }

    let mut buffer = [0u8; 8192];
    loop {
        let bytes_read = match upstream_reader.read(&mut buffer) {
            Ok(0) | Err(_) => return,
            Ok(n) => n,
        };

        if client_writer.write_all(&buffer[..bytes_read]).is_err() {
            return;
        }
    }
}