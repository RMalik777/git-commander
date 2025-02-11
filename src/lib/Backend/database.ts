import { invoke } from "@tauri-apps/api";
import { RepoFormat } from "@/lib/Types/Repo";

/**
 * Checks if a repository name is a duplicate.
 *
 * This function retrieves all repositories and checks if the provided
 * repository name already exists among them.
 *
 * @param repoName - The name of the repository to check for duplication.
 * @returns A promise that resolves to `true` if the repository name is a duplicate, otherwise `false`.
 */
export async function checkNameDup(repoName: string) {
  const response = await getAllRepo();
  const nameIsDuplicate = response.find((repo) => repo.repo_name === repoName);
  if (nameIsDuplicate) {
    return true;
  }
  return false;
}

/**
 * Checks if the given repository URL is a duplicate in the database.
 *
 * @param repoUrl - The URL of the repository to check for duplicates.
 * @returns A promise that resolves to `true` if the URL is a duplicate, otherwise `false`.
 */
export async function checkUrlDup(repoUrl: string) {
  const response = await getAllRepo();
  const urlIsDuplicate = response.find((repo) => repo.repo_url === repoUrl);
  if (urlIsDuplicate) {
    return true;
  }
  return false;
}

/**
 * Deletes all remote repositories.
 *
 * This function invokes the `delete_all_remote_repo` command to delete all remote repositories.
 * If an error occurs during the invocation, it logs the error to the console and throws a new error.
 *
 * @throws Throws an error if the invocation fails.
 */
export async function deleteAllRemoteRepo() {
  try {
    await invoke("delete_all_remote_repo");
  } catch (error) {
    console.error(error);
    throw new Error(error as string);
  }
}

/**
 * Deletes a remote repository by its ID.
 *
 * This function invokes the `delete_remote_repo_by_id` command with the provided ID.
 * If an error occurs during the invocation, it logs the error to the console and throws an error.
 *
 * @param id - The ID of the remote repository to delete.
 * @throws Throws an error if the invocation fails.
 */
export async function deleteRemoteRepoById(id: string) {
  try {
    await invoke("delete_remote_repo_by_id", { id: id });
  } catch (error) {
    console.error(error);
    throw Error(error as string);
  }
}

/**
 * Retrieves all remote repositories.
 *
 * This function invokes the `get_all_remote_repo` command to fetch a list of all remote repositories.
 * If the invocation is successful, it returns an array of `RepoFormat` objects.
 * If an error occurs during the invocation, it logs the error to the console and throws an error.
 *
 * @returns A promise that resolves to an array of `RepoFormat` objects.
 * @throws Throws an error if the invocation fails.
 */
export async function getAllRepo() {
  try {
    const response: RepoFormat[] = await invoke("get_all_remote_repo");
    return response;
  } catch (error) {
    console.error(error);
    throw Error(error as string);
  }
}

/**
 * Retrieves a repository by its ID.
 *
 * This function invokes the `get_remote_repo_by_id` command to fetch the repository
 * details from a remote source. If the operation is successful, it returns the
 * repository data in the `RepoFormat` format. If an error occurs, it logs the error
 * to the console and throws an error.
 *
 * @param id - The unique identifier of the repository to retrieve.
 * @returns A promise that resolves to the repository data.
 * @throws Will throw an error if the invocation fails.
 */
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

/**
 * Inserts a new repository into the database.
 *
 * This function checks if the repository URL already exists in the database.
 * If it does, an error is thrown. Otherwise, it invokes the `insert_remote_repo`
 * command to add the repository.
 *
 * @param repoName - The name of the repository to be inserted.
 * @param repoUrl - The URL of the repository to be inserted.
 * @throws If the repository URL already exists or if there is an error during insertion.
 */
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

/**
 * Updates the remote repository details by its ID.
 *
 * @param id - The unique identifier of the remote repository.
 * @param newRepoName - The new name for the remote repository.
 * @param newRepoUrl - The new URL for the remote repository.
 * @returns A promise that resolves when the remote repository is successfully updated.
 * @throws Throws an error if the update operation fails.
 */
export async function updateRemoteRepoById(id: string, newRepoName: string, newRepoUrl: string) {
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
