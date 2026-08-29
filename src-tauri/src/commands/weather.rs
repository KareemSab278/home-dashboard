use crate::models::{WeatherCurrent, WeatherData};

#[tauri::command]
pub async fn get_weather() -> Result<WeatherCurrent, String> {
    unimplemented!()
}

#[tauri::command]
pub async fn get_weather_forecast() -> Result<WeatherData, String> {
    unimplemented!()
}
