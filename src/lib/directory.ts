import { readDir } from "@tauri-apps/api/fs";
import { sortAndFilter } from "./functions";
import { Store } from "tauri-plugin-store-api";

export async function getAllChildDir(repo: string) {
  const fileStore = new Store(".fileList.json");
  try {
    const directory = await readDir(repo, { recursive: true });
    const sorted = await sortAndFilter(directory, repo);
    await fileStore.set("fileList", sorted);
    await fileStore.save();
    return sorted;
  } catch (error) {
    console.error(error);
    return [];
  }
}
