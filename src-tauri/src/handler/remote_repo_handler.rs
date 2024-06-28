use crate::model::remote_repo::RemoteRepo;
use crate::repository::remote_repo_repository;
use chrono::NaiveDateTime;
use uuid::Uuid;

#[tauri::command]
pub fn get_all_remote_repo() -> Result<Vec<RemoteRepo>, String> {
    remote_repo_repository::get_all_remote_repo()
}
