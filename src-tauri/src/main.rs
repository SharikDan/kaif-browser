#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{Manager, WindowEvent};

fn main() {
    tauri::Builder::default()
        .on_window_event(|event| {
            if let WindowEvent::CloseRequested { .. } = event.event() {
                if event.window().label() == "main" {
                    let app = event.window().app_handle();
                    for window in app.windows().values() {
                        if window.label().starts_with("webview-") {
                            let _ = window.close();
                        }
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}