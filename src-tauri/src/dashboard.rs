use crate::types::{DashboardData, Reminder, RemindersResult};

#[tauri::command]
pub async fn get_dashboard() -> Result<DashboardData, String> {
    unimplemented!()
}

#[tauri::command]
pub async fn get_today_overview() -> Result<Vec<Reminder>, String> {
    unimplemented!()
}

#[tauri::command]
pub async fn get_upcoming_items() -> Result<RemindersResult, String> {
    unimplemented!()
}

#[tauri::command]
pub async fn get_next_item() -> Result<Option<Reminder>, String> {
    unimplemented!()
}
