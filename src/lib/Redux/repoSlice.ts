import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FileEntry } from "@tauri-apps/api/fs";
import { Store } from "tauri-plugin-store-api";

export interface RepoState {
  name: string;
  directory: string;
  branch: string;
  diff: FileEntry[];
  staged: FileEntry[];
}

const diffStore = new Store(".diffList.json");
const stagedStore = new Store(".stagedList.json");
const initialState: RepoState = {
  name: localStorage.getItem("currentRepoName") ?? "",
  directory: localStorage.getItem("repoDir") ?? "",
  branch: localStorage.getItem("currentBranch") ?? "",
  diff: (await diffStore.get("diffList")) ?? [],
  staged: (await stagedStore.get("stagedList")) ?? [],
};

export const repoSlice = createSlice({
  name: "repo",
  initialState,
  reducers: {
    setRepo: (
      state,
      action: PayloadAction<{
        name?: string;
        directory?: string;
        branch?: string;
        diff?: FileEntry[];
        staged?: FileEntry[];
      }>
    ) => {
      state.name = action.payload.name ?? state.name;
      state.directory = action.payload.directory ?? state.directory;
      state.branch = action.payload.branch ?? state.branch;
      state.diff = action.payload.diff ?? state.diff;
      state.staged = action.payload.staged ?? state.staged;
    },
    removeRepo: (state) => {
      state.name = "";
      state.directory = "";
      state.branch = "";
      state.diff = [];
      state.staged = [];
    },
  },
});

export const { setRepo, removeRepo } = repoSlice.actions;
export default repoSlice.reducer;
