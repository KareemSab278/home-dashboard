use crate::models::{CreateReminderInput, RemindersResult, EditReminderInput};
// these will run the sql queries for managing reminders

// should probably create an abstraction for it.

#[tauri::command]
pub async fn get_reminders() -> Result<RemindersResult, String> {
    unimplemented!()
}

#[tauri::command]
pub async fn create_reminder(reminder: CreateReminderInput) -> Result<RemindersResult, String> {
    unimplemented!()
}

#[tauri::command]
pub async fn edit_reminder(id: String, reminder: EditReminderInput) -> Result<RemindersResult, String> {
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
