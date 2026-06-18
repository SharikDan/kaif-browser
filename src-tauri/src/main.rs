#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{Manager, WindowEvent, Runtime};
use serde::Serialize;

#[derive(Serialize, Clone)]
struct NavigationPayload {
    url: String,
    source_label: String,
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();
            
            // Слушаем все события создания окон
            app.listen_global("webview-created", move |event| {
                println!("WebView created: {:?}", event.payload());
            });
            
            Ok(())
        })
        .on_window_event(|event| {
            if let WindowEvent::CloseRequested { api, .. } = event.event() {
                // Если закрывается главное окно - закрываем все webview окна
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
        .invoke_handler(tauri::generate_handler![
            create_webview_with_navigation,
            emit_navigation_event
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn create_webview_with_navigation(
    window: tauri::Window,
    label: String,
    url: String,
    title: String,
    width: f64,
    height: f64,
    x: f64,
    y: f64,
) -> Result<(), String> {
    let app_handle = window.app_handle();
    
    // Создаём новое WebView окно
    let webview = tauri::WindowBuilder::new(
        &app_handle,
        &label,
        tauri::WindowUrl::App(url.parse().unwrap_or_default())
    )
    .title(&title)
    .inner_size(width, height)
    .position(x, y)
    .resizable(false)
    .decorations(false)
    .visible(true)
    .always_on_top(true)
    .skip_taskbar(true)
    .build()
    .map_err(|e| e.to_string())?;
    
    // Перехватываем навигацию
    let label_clone = label.clone();
    let app_clone = app_handle.clone();
    webview.on_navigation(move |url| {
        let url_str = url.to_string();
        
        // Игнорируем первую загрузку и внутренние навигации
        if url_str.starts_with("tauri://") || url_str.starts_with("https://tauri.localhost") {
            return true;
        }
        
        // Если это внешняя ссылка - отправляем событие в frontend
        let payload = NavigationPayload {
            url: url_str.clone(),
            source_label: label_clone.clone(),
        };
        
        let _ = app_clone.emit_all("webview-navigation", &payload);
        
        // Блокируем навигацию в текущем окне (откроем в новой вкладке)
        false
    });
    
    Ok(())
}

#[tauri::command]
fn emit_navigation_event(window: tauri::Window, url: String, source_label: String) -> Result<(), String> {
    let payload = NavigationPayload { url, source_label };
    window.emit_all("webview-navigation", &payload).map_err(|e| e.to_string())
}