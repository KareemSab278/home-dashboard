mod commands;
mod models;
mod services;
mod state;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::dashboard::get_dashboard,
            commands::dashboard::get_today_overview,
            commands::dashboard::get_upcoming_items,
            commands::dashboard::get_next_item,
            commands::weather::get_weather,
            commands::weather::get_weather_forecast,
            commands::reminders::get_reminders,
            commands::reminders::create_reminder,
            commands::reminders::edit_reminder,
            commands::reminders::complete_reminder,
            commands::reminders::dismiss_reminder,
            commands::reminders::delete_reminder,
            commands::system::get_system_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}
