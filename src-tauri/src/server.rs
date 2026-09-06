use crate::db;
use crate::types::{CreateReminderInput, Reminder};
use rusqlite::{params, Row};
use serde_json::json;
use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::{SocketAddr, TcpListener, TcpStream, UdpSocket};
use std::thread;

fn row_to_reminder(row: &Row) -> rusqlite::Result<Reminder> {
    let status_text: String = row.get(4)?;
    Ok(Reminder {
        id: row.get::<_, i64>(0)?.to_string(),
        title: row.get(1)?,
        due_date: row.get(2)?,
        due_time: row.get(3)?,
        status: crate::types::ItemStatus::from_str(&status_text),
        completed: row.get::<_, i64>(5)? != 0,
    })
}

fn get_reminders_from_db() -> Result<Vec<Reminder>, String> {
    let conn = db::open_reminders_connection().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT * FROM reminders
             ORDER BY due_date ASC, due_time IS NULL, due_time ASC",
        )
        .map_err(|e| e.to_string())?;

    let reminders = stmt
        .query_map([], |row| row_to_reminder(row))
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(reminders)
}

fn create_reminder_in_db(reminder: CreateReminderInput) -> Result<Vec<Reminder>, String> {
    let conn = db::open_reminders_connection().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO reminders (title, due_date, due_time) VALUES (?1, ?2, ?3)",
        params![reminder.title, reminder.due_date, reminder.due_time],
    )
    .map_err(|e| e.to_string())?;

    get_reminders_from_db()
}

fn delete_reminder_from_db(id: i64) -> Result<Vec<Reminder>, String> {
    let conn = db::open_reminders_connection().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM reminders WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    get_reminders_from_db()
}

fn parse_query_string(query: &str) -> HashMap<String, String> {
    query
        .split('&')
        .filter_map(|pair| pair.split_once('='))
        .map(|(name, value)| {
            (
                url_decode(name).unwrap_or_else(|| name.to_string()),
                url_decode(value).unwrap_or_else(|| value.to_string()),
            )
        })
        .collect()
}

fn url_decode(value: &str) -> Option<String> {
    percent_encoding::percent_decode_str(value)
        .decode_utf8()
        .ok()
        .map(|cow| cow.into_owned())
}

fn get_local_ip() -> String {
    let socket = UdpSocket::bind("0.0.0.0:0").unwrap();
    socket.connect("8.8.8.8:80").unwrap();
    socket.local_addr().unwrap().ip().to_string()
}

fn build_response(status: &str, content_type: &str, body: &str) -> String {
    format!(
        "HTTP/1.1 {}\r\nContent-Type: {}\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
        status,
        content_type,
        body.len(),
        body,
    )
}

fn serve_index() -> String {
    let manifest_dir = env!("CARGO_MANIFEST_DIR");
    let index_path = std::path::Path::new(manifest_dir).join("static/index.html");
    std::fs::read_to_string(&index_path)
        .unwrap_or_else(|_| panic!("Failed to find index.html file at {}", index_path.display()))
}

fn handle_request(mut stream: TcpStream) {
    let mut buffer = [0; 16_384];
    let bytes_read = match stream.read(&mut buffer) {
        Ok(0) => return,
        Ok(n) => n,
        Err(_) => return,
    };

    let request = String::from_utf8_lossy(&buffer[..bytes_read]);
    let mut lines = request.lines();
    let request_line = lines.next().unwrap_or_default();
    let mut parts = request_line.split_whitespace();
    let method = parts.next().unwrap_or_default();
    let path_with_query = parts.next().unwrap_or_default();
    let (path, query) = if let Some(index) = path_with_query.find('?') {
        (&path_with_query[..index], &path_with_query[index + 1..])
    } else {
        (path_with_query, "")
    };

    let headers = request
        .split("\r\n")
        .skip(1)
        .take_while(|line| !line.is_empty())
        .filter_map(|line| line.split_once(": "))
        .map(|(k, v)| (k.to_ascii_lowercase(), v.to_string()))
        .collect::<HashMap<_, _>>();

    let body = if let Some(length) = headers.get("content-length") {
        if let Ok(size) = length.parse::<usize>() {
            let start = request.find("\r\n\r\n").map(|i| i + 4).unwrap_or(bytes_read);
            let slice = &buffer[start..bytes_read.min(start + size)];
            slice.to_vec()
        } else {
            Vec::new()
        }
    } else {
        Vec::new()
    };

    let response = match (method, path) {
        ("GET", "/") => build_response("200 OK", "text/html; charset=utf-8", &serve_index()),
        ("GET", "/api/reminders") => match get_reminders_from_db() {
            Ok(reminders) => build_response(
                "200 OK",
                "application/json; charset=utf-8",
                &serde_json::to_string(&reminders).unwrap_or_else(|_| "[]".to_string()),
            ),
            Err(err) => build_response(
                "500 Internal Server Error",
                "application/json; charset=utf-8",
                &json!({ "error": err }).to_string(),
            ),
        },
        ("POST", "/api/reminders") => {
            let payload = serde_json::from_slice::<CreateReminderInput>(&body);
            match payload {
                Ok(reminder) => match create_reminder_in_db(reminder) {
                    Ok(reminders) => build_response(
                        "200 OK",
                        "application/json; charset=utf-8",
                        &serde_json::to_string(&reminders).unwrap_or_else(|_| "[]".to_string()),
                    ),
                    Err(err) => build_response(
                        "500 Internal Server Error",
                        "application/json; charset=utf-8",
                        &json!({ "error": err }).to_string(),
                    ),
                },
                Err(_) => build_response(
                    "400 Bad Request",
                    "application/json; charset=utf-8",
                    &json!({ "error": "invalid body" }).to_string(),
                ),
            }
        }
        ("DELETE", "/api/reminders") => {
            let query_map = parse_query_string(query);
            if let Some(id_str) = query_map.get("id") {
                if let Ok(id) = id_str.parse::<i64>() {
                    match delete_reminder_from_db(id) {
                        Ok(reminders) => build_response(
                            "200 OK",
                            "application/json; charset=utf-8",
                            &serde_json::to_string(&reminders).unwrap_or_else(|_| "[]".to_string()),
                        ),
                        Err(err) => build_response(
                            "500 Internal Server Error",
                            "application/json; charset=utf-8",
                            &json!({ "error": err }).to_string(),
                        ),
                    }
                } else {
                    build_response(
                        "400 Bad Request",
                        "application/json; charset=utf-8",
                        &json!({ "error": "invalid id" }).to_string(),
                    )
                }
            } else {
                build_response(
                    "400 Bad Request",
                    "application/json; charset=utf-8",
                    &json!({ "error": "missing id" }).to_string(),
                )
            }
        }
        _ => build_response(
            "404 Not Found",
            "text/plain; charset=utf-8",
            "Not found",
        ),
    };

    let _ = stream.write_all(response.as_bytes());
}

pub fn start() {
    thread::spawn(|| {
        let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
        let listener = match TcpListener::bind(addr) {
            Ok(listener) => listener,
            Err(error) => {
                eprintln!("Failed to bind server port 3000: {}", error);
                return;
            }
        };

        let local_ip = get_local_ip();
        println!("Server running on http://{}:3000", local_ip);

        for stream in listener.incoming() {
            if let Ok(stream) = stream {
                thread::spawn(|| handle_request(stream));
            }
        }
    });
}


#[tauri::command]
pub async fn show_address() -> Result<String, String> {
    let local_ip = get_local_ip();
    Ok(format!("http://{}:3000", local_ip))
}