use crate::db::establish_db_connection;
use crate::model::remote_repo::RemoteRepo;
use crate::schema::remote_repository;
use crate::schema::remote_repository::dsl;
use diesel::prelude::*;

pub fn get_all_remote_repo() -> Result<Vec<RemoteRepo>, String> {
  let connection = &mut establish_db_connection();

  dsl::remote_repository
    .order_by(dsl::created_at.desc())
    .load::<RemoteRepo>(connection)
    .map_err(|e| e.to_string())
}

pub fn get_remote_repo_by_id(id: &str) -> Result<RemoteRepo, String> {
  let connection = &mut establish_db_connection();

  dsl::remote_repository
    .find(id)
    .first(connection)
    .map_err(|e| e.to_string())
}

pub fn insert_remote_repo(remote_repo: RemoteRepo) -> Result<usize, String> {
  let connection = &mut establish_db_connection();

  diesel::insert_into(remote_repository::table)
    .values(&remote_repo)
    .execute(connection)
    .map_err(|e| e.to_string())
}

pub fn update_remote_repo(id: &str, repo_name: &str, repo_url: &str) -> Result<usize, String> {
  let connection = &mut establish_db_connection();

  diesel::update(dsl::remote_repository.find(id))
    .set((dsl::repo_name.eq(repo_name), dsl::repo_url.eq(repo_url)))
    .execute(connection)
    .map_err(|e| e.to_string())
}

pub fn update_remote_repo_name(id: &str, repo_name: &str) -> Result<usize, String> {
  let connection = &mut establish_db_connection();

  diesel::update(dsl::remote_repository)
    .filter(dsl::id.eq(id))
    .set(dsl::repo_name.eq(repo_name))
    .execute(connection)
    .map_err(|e| e.to_string())
}

pub fn update_remote_repo_url(id: &str, repo_url: &str) -> Result<usize, String> {
  let connection = &mut establish_db_connection();

  diesel::update(dsl::remote_repository)
    .filter(dsl::id.eq(id))
    .set(dsl::repo_url.eq(repo_url))
    .execute(connection)
    .map_err(|e| e.to_string())
}

pub fn delete_remote_repo_by_id(id: &str) -> Result<usize, String> {
  let connection = &mut establish_db_connection();

  diesel::delete(dsl::remote_repository.filter(dsl::id.eq(id)))
    .execute(connection)
    .map_err(|e| e.to_string())
}

pub fn delete_all_remote_repo() -> Result<usize, String> {
  let connection = &mut establish_db_connection();
  diesel::delete(dsl::remote_repository)
    .execute(connection)
    .map_err(|e| e.to_string())
}
