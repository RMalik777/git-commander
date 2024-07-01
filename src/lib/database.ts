import { invoke } from "@tauri-apps/api";
import { RepoFormat } from "@/lib/Types/repo";

export async function getAllRepo() {
  try {
    const response: RepoFormat[] = await invoke("get_all_remote_repo");
    return response;
  } catch (error) {
    console.error(error);
    throw Error(error as string);
  }
}

export async function getRepoById(id: string) {
  try {
    const response: RepoFormat = await invoke("get_remote_repo_by_id", {
      id: id,
    });
    return response;
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
    return new Error(error as string);
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
