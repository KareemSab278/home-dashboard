use crate::db;
use crate::types::{CreateReminderInput, EditReminderInput, ItemStatus, Reminder, RemindersResult};
use rusqlite::{params, Row};

fn row_to_reminder(row: &Row) -> rusqlite::Result<Reminder> {
    let status_text: String = row.get(4)?;
    Ok(Reminder {
        id: row.get::<_, i64>(0)?.to_string(),
        title: row.get(1)?,
        due_date: row.get(2)?,
        due_time: row.get(3)?,
        status: ItemStatus::from_str(&status_text),
        completed: row.get::<_, i64>(5)? != 0,
    })
}

#[tauri::command]
pub async fn get_reminders() -> Result<RemindersResult, String> {
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

    Ok(RemindersResult { reminders })
}

#[tauri::command]
pub async fn create_reminder(reminder: CreateReminderInput) -> Result<RemindersResult, String> {
    let conn = db::open_reminders_connection().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO reminders (title, due_date, due_time) VALUES (?1, ?2, ?3)",
        params![reminder.title, reminder.due_date, reminder.due_time],
    )
    .map_err(|e| e.to_string())?;

    get_reminders().await
}

#[tauri::command]
pub async fn edit_reminder(
    id: String,
    reminder: EditReminderInput,
) -> Result<RemindersResult, String> {
    let id = id
        .parse::<i64>()
        .map_err(|e| format!("invalid reminder id: {}", e))?;
    let conn = db::open_reminders_connection().map_err(|e| e.to_string())?;

    if let Some(title) = reminder.title {
        conn.execute(
            "UPDATE reminders SET title = ?1 WHERE id = ?2",
            params![title, id],
        )
        .map_err(|e| e.to_string())?;
    }

    if let Some(due_date) = reminder.due_date {
        conn.execute(
            "UPDATE reminders SET due_date = ?1 WHERE id = ?2",
            params![due_date, id],
        )
        .map_err(|e| e.to_string())?;
    }

    if let Some(due_time) = reminder.due_time {
        conn.execute(
            "UPDATE reminders SET due_time = ?1 WHERE id = ?2",
            params![due_time, id],
        )
        .map_err(|e| e.to_string())?;
    }

    get_reminders().await
}

#[tauri::command]
pub async fn complete_reminder(id: String) -> Result<RemindersResult, String> {
    let id = id
        .parse::<i64>()
        .map_err(|e| format!("invalid reminder id: {}", e))?;
    let conn = db::open_reminders_connection().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE reminders SET status = 'completed', completed = 1 WHERE id = ?1",
        params![id],
    )
    .map_err(|e| e.to_string())?;

    get_reminders().await
}

#[tauri::command]
pub async fn dismiss_reminder(id: String) -> Result<RemindersResult, String> {
    let id = id
        .parse::<i64>()
        .map_err(|e| format!("invalid reminder id: {}", e))?;
    let conn = db::open_reminders_connection().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE reminders SET status = 'dismissed' WHERE id = ?1",
        params![id],
    )
    .map_err(|e| e.to_string())?;

    get_reminders().await
}

#[tauri::command]
pub async fn delete_reminder(id: String) -> Result<RemindersResult, String> {
    let id = id
        .parse::<i64>()
        .map_err(|e| format!("invalid reminder id: {}", e))?;
    let conn = db::open_reminders_connection().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM reminders WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    get_reminders().await
}
