// shared data structures — mirrors src/Types.ts on the frontend
use serde::{Deserialize, Serialize};

// ── status ────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ItemStatus {
    Upcoming,
    DueSoon,
    Due,
    Overdue,
    Completed,
    Dismissed,
}

impl ItemStatus {
    pub fn from_str(value: &str) -> Self {
        match value {
            "due_soon" => ItemStatus::DueSoon,
            "due" => ItemStatus::Due,
            "overdue" => ItemStatus::Overdue,
            "completed" => ItemStatus::Completed,
            "dismissed" => ItemStatus::Dismissed,
            _ => ItemStatus::Upcoming,
        }
    }
}

// ── reminders ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Reminder {
    pub id: String,
    pub title: String,
    pub due_date: String,         // ISO date "2026-08-29"
    pub due_time: Option<String>, // "14:30" or null for all-day
    pub status: ItemStatus,
    pub completed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RemindersResult {
    pub reminders: Vec<Reminder>,
}

#[derive(Debug, Deserialize)]
pub struct CreateReminderInput {
    pub title: String,
    pub due_date: String,
    pub due_time: Option<String>,
}

// None = don't change; Some(None) = clear; Some(Some(v)) = set
#[derive(Debug, Deserialize)]
pub struct EditReminderInput {
    pub title: Option<String>,
    pub due_date: Option<String>,
    pub due_time: Option<Option<String>>,
}

// ── weather ───────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WeatherCurrent {
    pub temperature: Option<f64>,
    pub feels_like: Option<f64>,
    pub high: Option<f64>,
    pub low: Option<f64>,
    pub description: Option<String>,
    pub rain_probability: Option<f64>,
    pub wind_speed: Option<f64>,
    pub sunrise: Option<String>,
    pub sunset: Option<String>,
    pub icon: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WeatherForecastDay {
    pub date: String,
    pub high: Option<f64>,
    pub low: Option<f64>,
    pub description: Option<String>,
    pub rain_probability: Option<f64>,
    pub icon: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WeatherData {
    pub current: WeatherCurrent,
    pub forecast: Vec<WeatherForecastDay>,
}

// ── dashboard ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardNow {
    pub time: String,
    pub date: String,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardData {
    pub now: DashboardNow,
    pub weather: Option<WeatherCurrent>,
    pub reminders: Vec<Reminder>,
}

