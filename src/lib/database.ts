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
    throw Error(error as string);
  }
}

export async function insertIntoRepo(repoName: string, repoUrl: string) {
  const isDuplicate = await checkUrlDup(repoUrl);
  if (isDuplicate) {
    throw new Error("Repository URL already exists");
  }
  try {
    await invoke("insert_remote_repo", {
      repoName: repoName,
      repoUrl: repoUrl,
    });
  } catch (error) {
    console.error(error);
    throw new Error(error as string);
  }
}

export async function deleteRemoteRepoById(id: string) {
  try {
    await invoke("delete_remote_repo_by_id", { id: id });
  } catch (error) {
    console.error(error);
    throw Error(error as string);
  }
}

export async function deleteAllRemoteRepo() {
  try {
    await invoke("delete_all_remote_repo");
  } catch (error) {
    console.error(error);
    throw Error(error as string);
  }
}

export async function updateRemoteRepoById(
  id: string,
  newRepoName: string,
  newRepoUrl: string
) {
  try {
    await invoke("edit_remote_repo", {
      id: id,
      repoName: newRepoName,
      repoUrl: newRepoUrl,
    });
  } catch (error) {
    console.error(error);
    throw Error(error as string);
  }
}

async function checkUrlDup(repoUrl: string) {
  const response = await getAllRepo();
  const urlIsDuplicate = response.find((repo) => repo.repo_url === repoUrl);
  if (urlIsDuplicate) {
    return true;
  }
  return false;
}
