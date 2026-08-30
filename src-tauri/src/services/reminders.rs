use rusqlite::{params, Connection, Result};
use serde::Serialize;
use std::fs;
use std::path::PathBuf;

const REMINDERS_DATA_FILE: &str = "reminders.db";

fn reminders_db_path() -> PathBuf {
    let home = std::env::var("USERPROFILE")
        .or_else(|_| std::env::var("HOME"))
        .unwrap_or_else(|_| std::env::temp_dir().to_string_lossy().into_owned());
    let dir = PathBuf::from(home).join("data");
    let _ = fs::create_dir_all(&dir);
    dir.join(REMINDERS_DATA_FILE)
}

pub fn initialize_reminders_db() -> Result<()> {
    let conn = Connection::open(reminders_db_path())?;
    conn.execute_batch(REMINDERS_DB_SCHEMA)?;
    Ok(())
}



const REMINDERS_DB_SCHEMA: &str = "
    CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        due_date TEXT NOT NULL,
        due_time TEXT,
        status TEXT NOT NULL DEFAULT 'upcoming',
        completed INTEGER NOT NULL DEFAULT 0
    );
";
