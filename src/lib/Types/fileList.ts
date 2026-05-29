import type { DirEntryWithPath } from "@/lib/Types/Duplicate";

export interface FileList extends DirEntryWithPath {
  type: "File" | "Folder";
}
