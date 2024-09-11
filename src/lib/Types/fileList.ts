import type { FileEntry } from "@tauri-apps/api/fs";

export interface FileList extends FileEntry {
  type: "File" | "Folder";
}
