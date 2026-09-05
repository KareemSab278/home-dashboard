use std::fs;
use std::path::PathBuf;

use tauri::{AppHandle, Manager};

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