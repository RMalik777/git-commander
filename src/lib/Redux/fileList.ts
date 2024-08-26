import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FileEntry } from "@tauri-apps/api/fs";
import { Store } from "tauri-plugin-store-api";

export interface FileList {
  files: FileEntry[];
}
const store = new Store(".fileList.json");
const initialState: FileList = {
  files: (await store.get("fileList")) ?? [],
};

export const fileListSlice = createSlice({
  name: "fileList",
  initialState,
  reducers: {
    setFiles: (state, action: PayloadAction<FileEntry[]>) => {
      state.files = action.payload;
    },
    addFiles: (state, action: PayloadAction<FileEntry>) => {
      state.files.push(action.payload);
    },
    removeFiles: (state) => {
      state.files = [];
    },
  },
});

export const { setFiles, addFiles, removeFiles } = fileListSlice.actions;
export default fileListSlice.reducer;
