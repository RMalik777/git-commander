// @generated automatically by Diesel CLI.

diesel::table! {
    remote_repository (id) {
        id -> Text,
        repo_name -> Text,
        repo_url -> Text,
        created_at -> Timestamp,
    }
}
