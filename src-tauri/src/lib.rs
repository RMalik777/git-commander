// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod handler;
mod model;
mod repository;
mod schema;
mod terminal;

use handler::remote_repo_handler::*;
use portable_pty::{native_pty_system, PtySize};
use std::{io::BufReader, sync::Arc};
use tauri::async_runtime::Mutex as AsyncMutex;
use terminal::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let pty_system = native_pty_system();

    let pty_pair = pty_system
        .openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_width: 0,
            pixel_height: 0,
        })
        .unwrap();

    let reader = pty_pair.master.try_clone_reader().unwrap();
    let writer = pty_pair.master.take_writer().unwrap();
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .manage(AppState {
            pty_pair: Arc::new(AsyncMutex::new(pty_pair)),
            writer: Arc::new(AsyncMutex::new(writer)),
            reader: Arc::new(AsyncMutex::new(BufReader::new(reader))),
        })
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_clipboard_manager::init())

        .setup(|_app| {
            db::init();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_all_remote_repo,
            get_remote_repo_by_id,
            insert_remote_repo,
            edit_remote_repo,
            edit_remote_repo_name,
            edit_remote_repo_url,
            delete_all_remote_repo,
            delete_remote_repo_by_id,
            async_write_to_pty,
            async_resize_pty,
            async_create_shell,
            async_read_from_pty
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
