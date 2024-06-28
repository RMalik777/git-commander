import { invoke } from "@tauri-apps/api";

export async function getAllRepo() {
  try {
    const response = await invoke("get_all_remote_repo");
    return await response;
  } catch (error) {
    console.error(error);
  }
}

export async function getRepoById(id: string) {
  try {
    const response = await invoke("get_remote_repo_by_id", { id: id });
    return await response;
  } catch (error) {
    console.error(error);
  }
}

export async function insertIntoRepo(repoName: string, repoUrl: string) {
  try {
    const response = await invoke("insert_remote_repo", {
      repoName: repoName,
      repoUrl: repoUrl,
    });
    return await response;
  } catch (error) {
    console.error(error);
  }
}

export async function deleteRemoteRepoById(id: string) {
  try {
    const response = await invoke("delete_remote_repo_by_id", { id: id });
    return await response;
  } catch (error) {
    console.error(error);
  }
}

export async function deleteAllRemoteRepo() {
  try {
    const response = await invoke("delete_all_remote_repo");
    return await response;
  } catch (error) {
    console.error(error);
  }
}
