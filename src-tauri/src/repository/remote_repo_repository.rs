use crate::db::establish_db_connection;
use crate::model::remote_repo::RemoteRepo;
use crate::schema::remote_repository;
use crate::schema::remote_repository::dsl;
use chrono::NaiveDateTime;
use diesel::prelude::*;

pub fn get_all_remote_repo() -> Result<Vec<RemoteRepo>, String> {
    let connection = &mut establish_db_connection();

    dsl::remote_repository
        .order_by(dsl::created_at.desc())
        .load::<RemoteRepo>(connection)
        .map_err(|e| e.to_string())
}
