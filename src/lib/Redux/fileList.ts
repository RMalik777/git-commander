import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { DirEntryWithPath } from "@/lib/Types/Duplicate";
import { Store } from "@tauri-apps/plugin-store";

export interface FileList {
  files: DirEntryWithPath[] | undefined;
}
const store = await Store.load(".fileList.json");
const initialState: FileList = {
  files: (await store.get("fileList")) ?? undefined,
};

export const fileListSlice = createSlice({
  name: "fileList",
  initialState,
  reducers: {
    setFiles: (state, action: PayloadAction<DirEntryWithPath[]>) => {
      state.files = action.payload;
    },
    removeFiles: (state) => {
      state.files = undefined;
    },
  },
});

export const { setFiles, removeFiles } = fileListSlice.actions;
export default fileListSlice.reducer;
