use crate::model::remote_repo::RemoteRepo;
use crate::repository::remote_repo_repository;
use uuid::Uuid;

#[tauri::command]
pub fn get_all_remote_repo() -> Result<Vec<RemoteRepo>, String> {
  remote_repo_repository::get_all_remote_repo()
}

#[tauri::command]
pub fn get_remote_repo_by_id(id: String) -> Result<RemoteRepo, String> {
  remote_repo_repository::get_remote_repo_by_id(&id)
}

#[tauri::command]
pub fn insert_remote_repo(repo_name: String, repo_url: String) -> Result<usize, String> {
  let remote_repo = RemoteRepo {
    id: Uuid::new_v4().to_string(),
    repo_name,
    repo_url,
    created_at: chrono::Local::now().naive_local(),
  };
  remote_repo_repository::insert_remote_repo(remote_repo)
}

#[tauri::command]
pub fn edit_remote_repo(id: String, repo_name: String, repo_url: String) -> Result<usize, String> {
  remote_repo_repository::update_remote_repo(&id, &repo_name, &repo_url)
}

#[tauri::command]
pub fn edit_remote_repo_name(id: String, repo_name: String) -> Result<usize, String> {
  remote_repo_repository::update_remote_repo_name(&id, &repo_name)
}

#[tauri::command]
pub fn edit_remote_repo_url(id: String, repo_url: String) -> Result<usize, String> {
  remote_repo_repository::update_remote_repo_url(&id, &repo_url)
}

#[tauri::command]
pub fn delete_remote_repo_by_id(id: String) -> Result<usize, String> {
  remote_repo_repository::delete_remote_repo_by_id(&id)
}

#[tauri::command]
pub fn delete_all_remote_repo() -> Result<usize, String> {
  remote_repo_repository::delete_all_remote_repo()
}
