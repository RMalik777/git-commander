import type { Metadata } from "tauri-plugin-fs-extra-api";
import type { FileEntry } from "@tauri-apps/api/fs";

export interface FileEntryWithMetadata extends FileEntry, Metadata {}
