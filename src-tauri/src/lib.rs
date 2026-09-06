mod dashboard;
mod weather;
mod camera;
mod reminders;
mod system;
mod db;
mod server;
mod types;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // am i allowed to put this here? 
    db::initialize_reminders_db().unwrap();
    server::start();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(camera::CameraState {
            process: std::sync::Mutex::new(None),
            proxy_started: std::sync::Mutex::new(false),
            stream: std::sync::Arc::new(std::sync::Mutex::new(None)),
        })
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
            camera::save_photo,
            camera::start_camera_stream,
            camera::stop_camera_stream,
            server::show_address,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| {
            // Make sure FFmpeg doesn't keep running as an orphaned process after exit.
            if let tauri::RunEvent::Exit = event {
                let state: tauri::State<camera::CameraState> = app_handle.state();
                let _ = camera::stop_camera_process(&state);
            }
        });
}
