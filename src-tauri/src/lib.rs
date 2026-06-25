use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    tray::TrayIconBuilder,
    Manager,
};

#[tauri::command]
fn calculate(a: f64, b: f64, op: &str) -> String {
    match op {
        "+" => (a + b).to_string(),
        "−" => (a - b).to_string(),
        "×" => (a * b).to_string(),
        "÷" => {
            if b == 0.0 {
                "Error".to_string()
            } else {
                (a / b).to_string()
            }
        }
        _ => b.to_string(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Setup top menu bar
            let settings_i = MenuItem::with_id(app, "settings", "Settings...", true, Some("CmdOrCtrl+,"))?;
            let quit_i = PredefinedMenuItem::quit(app, None)?;
            
            let app_submenu = Submenu::with_items(
                app,
                "Calculator",
                true,
                &[
                    &settings_i,
                    &PredefinedMenuItem::separator(app)?,
                    &quit_i,
                ],
            )?;
            let menu = Menu::with_items(app, &[&app_submenu])?;
            app.set_menu(menu)?;

            // Setup system tray
            let show_i = MenuItem::with_id(app, "show", "Show Calculator", true, None::<&str>)?;
            let tray_menu = Menu::with_items(
                app,
                &[
                    &show_i,
                    &PredefinedMenuItem::separator(app)?,
                    &quit_i,
                ],
            )?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&tray_menu)
                .on_menu_event(|app, event| {
                    if event.id() == "show" {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_menu_event(|_app, event| {
            if event.id() == "settings" {
                println!("Settings clicked!");
                // You can emit an event to the frontend here if needed:
                // app.emit("open-settings", ()).unwrap();
            }
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![calculate])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
