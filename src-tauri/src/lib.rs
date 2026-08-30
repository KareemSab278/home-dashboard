mod dashboard;
mod weather;
mod reminders;
mod system;
mod db;
mod server;
mod types;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // am i allowed to put this here? 
    db::initialize_reminders_db().unwrap();
    server::start();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            dashboard::get_dashboard,
            dashboard::get_today_overview,
            dashboard::get_upcoming_items,
            dashboard::get_next_item,
            weather::get_weather,
            reminders::get_reminders,
            reminders::get_reminders_for_date,
            reminders::get_reminders_for_range,
            reminders::create_reminder,
            reminders::edit_reminder,
            reminders::complete_reminder,
            reminders::dismiss_reminder,
            reminders::delete_reminder,
            system::get_system_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}
