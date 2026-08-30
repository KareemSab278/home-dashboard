use crate::db;
use crate::types::{CreateReminderInput, EditReminderInput, ItemStatus, Reminder, RemindersResult};
use chrono::{Local, NaiveDate, NaiveDateTime, NaiveTime};
use rusqlite::{params, Row};

fn compute_status(due_date: &str, due_time: Option<&str>) -> ItemStatus {
    let now = Local::now().naive_local();
    let today = now.date();
    let Ok(date) = NaiveDate::parse_from_str(due_date, "%Y-%m-%d") else {
        return ItemStatus::Upcoming;
    };
    if date < today {
        return ItemStatus::Overdue;
    }
    if date > today {
        return ItemStatus::Upcoming;
    }
    match due_time {
        None => ItemStatus::Due,
        Some(t) => {
            let Ok(time) = NaiveTime::parse_from_str(t, "%H:%M") else {
                return ItemStatus::Due;
            };
            let diff = NaiveDateTime::new(date, time) - now;
            if diff.num_minutes() < 0 {
                ItemStatus::Overdue
            } else if diff.num_minutes() <= 60 {
                ItemStatus::DueSoon
            } else {
                ItemStatus::Due
            }
        }
    }
}

pub(crate) fn row_to_reminder(row: &Row) -> rusqlite::Result<Reminder> {
    let due_date: String = row.get(2)?;
    let due_time: Option<String> = row.get(3)?;
    let status_text: String = row.get(4)?;
    let completed = row.get::<_, i64>(5)? != 0;
    let status = if completed || status_text == "completed" {
        ItemStatus::Completed
    } else if status_text == "dismissed" {
        ItemStatus::Dismissed
    } else {
        compute_status(&due_date, due_time.as_deref())
    };
    Ok(Reminder {
        id: row.get::<_, i64>(0)?.to_string(),
        title: row.get(1)?,
        due_date,
        due_time,
        status,
        completed,
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
