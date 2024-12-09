use crate::schema::remote_repository;
use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable};
use serde::Serialize;

#[derive(Queryable, Serialize, Insertable)]
#[diesel(table_name = remote_repository)]

pub struct RemoteRepo {
  pub id: String,
  pub repo_name: String,
  pub repo_url: String,
  pub created_at: NaiveDateTime,
}
