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
            my_custom_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn my_custom_command() -> Result<(), String> {
  // This will return an error
  std::fs::File::open("path/that/does/not/exist").map_err(|err| err.to_string())?;
  // Return nothing on success
  Ok(())
}
