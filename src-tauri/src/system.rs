#[tauri::command]
pub fn get_system_info() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "os": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
    }))
}


#[tauri::command]
pub fn kill() {
    std::process::exit(0);
}