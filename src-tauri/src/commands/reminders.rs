use crate::models::{CreateReminderInput, RemindersResult, UpdateReminderInput};

#[tauri::command]
pub async fn get_reminders() -> Result<RemindersResult, String> {
    unimplemented!()
}

#[tauri::command]
pub async fn get_reminders_for_date(date: String) -> Result<RemindersResult, String> {
    unimplemented!()
}

#[tauri::command]
pub async fn get_reminders_for_range(start: String, end: String) -> Result<RemindersResult, String> {
    unimplemented!()
}

#[tauri::command]
pub async fn create_reminder(reminder: CreateReminderInput) -> Result<RemindersResult, String> {
    unimplemented!()
}

#[tauri::command]
pub async fn update_reminder(id: String, reminder: UpdateReminderInput) -> Result<RemindersResult, String> {
    unimplemented!()
}

#[tauri::command]
pub async fn complete_reminder(id: String) -> Result<RemindersResult, String> {
    unimplemented!()
}

#[tauri::command]
pub async fn dismiss_reminder(id: String) -> Result<RemindersResult, String> {
    unimplemented!()
}

#[tauri::command]
pub async fn delete_reminder(id: String) -> Result<RemindersResult, String> {
    unimplemented!()
}
