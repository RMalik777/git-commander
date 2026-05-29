import type { DirEntry, FileInfo } from "@tauri-apps/plugin-fs";

export interface DirEntryWithPath extends DirEntry {
  path: string;
  children?: DirEntryWithPath[];
}

export interface FileEntryWithMetadata extends DirEntryWithPath, FileInfo {}
