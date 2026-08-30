use crate::db;
use crate::reminders::row_to_reminder;
use crate::types::{DashboardData, DashboardNow, Reminder, RemindersResult};
use chrono::Local;

#[tauri::command]
pub async fn get_dashboard() -> Result<DashboardData, String> {
    let conn = db::open_reminders_connection().map_err(|e| e.to_string())?;
    let now = Local::now();
    let today = now.format("%Y-%m-%d").to_string();

    let mut stmt = conn
        .prepare(
            "SELECT * FROM reminders
             WHERE due_date >= ?1 AND completed = 0 AND status != 'dismissed'
             ORDER BY due_date ASC, due_time IS NULL, due_time ASC",
        )
        .map_err(|e| e.to_string())?;

    let reminders = stmt
        .query_map([&today], |row| row_to_reminder(row))
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(DashboardData {
        now: DashboardNow {
            time: now.format("%H:%M").to_string(),
            date: today,
            timestamp: now.to_rfc3339(),
        },
        weather: None,
        reminders,
    })
}

#[tauri::command]
pub async fn get_today_overview() -> Result<Vec<Reminder>, String> {
    let conn = db::open_reminders_connection().map_err(|e| e.to_string())?;
    let today = Local::now().format("%Y-%m-%d").to_string();

    let mut stmt = conn
        .prepare(
            "SELECT * FROM reminders
             WHERE due_date = ?1 AND completed = 0 AND status != 'dismissed'
             ORDER BY due_time IS NULL, due_time ASC",
        )
        .map_err(|e| e.to_string())?;

    let reminders = stmt
        .query_map([&today], |row| row_to_reminder(row))
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(reminders)
}

#[tauri::command]
pub async fn get_upcoming_items() -> Result<RemindersResult, String> {
    let conn = db::open_reminders_connection().map_err(|e| e.to_string())?;
    let today = Local::now().format("%Y-%m-%d").to_string();

    let mut stmt = conn
        .prepare(
            "SELECT * FROM reminders
             WHERE due_date >= ?1 AND completed = 0 AND status != 'dismissed'
             ORDER BY due_date ASC, due_time IS NULL, due_time ASC",
        )
        .map_err(|e| e.to_string())?;

    let reminders = stmt
        .query_map([&today], |row| row_to_reminder(row))
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(RemindersResult { reminders })
}

#[tauri::command]
pub async fn get_next_item() -> Result<Option<Reminder>, String> {
    let conn = db::open_reminders_connection().map_err(|e| e.to_string())?;
    let today = Local::now().format("%Y-%m-%d").to_string();

    let mut stmt = conn
        .prepare(
            "SELECT * FROM reminders
             WHERE due_date >= ?1 AND completed = 0 AND status != 'dismissed'
             ORDER BY due_date ASC, due_time IS NULL, due_time ASC
             LIMIT 1",
        )
        .map_err(|e| e.to_string())?;

    let mut rows = stmt
        .query_map([&today], |row| row_to_reminder(row))
        .map_err(|e| e.to_string())?;

    match rows.next() {
        Some(Ok(r)) => Ok(Some(r)),
        Some(Err(e)) => Err(e.to_string()),
        None => Ok(None),
    }
}
