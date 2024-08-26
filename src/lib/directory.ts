import { readDir } from "@tauri-apps/api/fs";
import { sortAndFilter } from "./functions";

export async function getAllChildDir(repo: string) {
  try {
    const directory = await readDir(repo, { recursive: true });
    const sorted = await sortAndFilter(directory, repo);
    return sorted;
  } catch (error) {
    console.error(error);
    return [];
  }
}
