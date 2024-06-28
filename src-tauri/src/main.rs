// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod handler;
mod model;
mod repository;
mod schema;

use handler::remote_repo_handler::*;
fn main() {
    tauri::Builder::default()
        .setup(|_app| {
            db::init();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_all_remote_repo,
            get_remote_repo_by_id,
            insert_remote_repo,
            delete_all_remote_repo,
            delete_remote_repo_by_id
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
