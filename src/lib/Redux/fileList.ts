import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FileEntry } from "@tauri-apps/api/fs";
import { Store } from "tauri-plugin-store-api";

export interface FileList {
  files: FileEntry[] | undefined;
}
const store = new Store(".fileList.json");
const initialState: FileList = {
  files: (await store.get("fileList")) ?? undefined,
};

export const fileListSlice = createSlice({
  name: "fileList",
  initialState,
  reducers: {
    setFiles: (state, action: PayloadAction<FileEntry[]>) => {
      state.files = action.payload;
    },
    removeFiles: (state) => {
      state.files = undefined;
    },
  },
});

export const { setFiles, removeFiles } = fileListSlice.actions;
export default fileListSlice.reducer;
