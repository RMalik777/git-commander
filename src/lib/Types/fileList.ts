import type { FileEntry } from "@tauri-apps/plugin-fs";

export interface FileList extends FileEntry {
  type: "File" | "Folder";
}
