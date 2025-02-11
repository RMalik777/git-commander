import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FileEntry } from "@tauri-apps/api/fs";
import { Store } from "tauri-plugin-store-api";

export interface RepoState {
  remoteHash: string;
  localHash: string;
  name: string;
  directory: string;
  branch: string;
  diff: FileEntry[];
  staged: FileEntry[];
  remoteUrl: string;
  commitcount: number;
  contributorsCount: number;
}

const diffStore = new Store(".diffList.json");
const stagedStore = new Store(".stagedList.json");
const initialState: RepoState = {
  remoteHash: localStorage.getItem("remoteRepoHash") ?? "",
  localHash: localStorage.getItem("localRepoHash") ?? "",
  name: localStorage.getItem("currentRepoName") ?? "",
  directory: localStorage.getItem("repoDir") ?? "",
  branch: localStorage.getItem("currentBranch") ?? "",
  diff: (await diffStore.get("diffList")) ?? [],
  staged: (await stagedStore.get("stagedList")) ?? [],
  remoteUrl: localStorage.getItem("remoteUrl") ?? "",
  commitcount: Number(localStorage.getItem("commitCount")) || 0,
  contributorsCount: Number(localStorage.getItem("contributorsCount")) || 0,
};

export const repoSlice = createSlice({
  name: "repo",
  initialState,
  reducers: {
    setRepo: (
      state,
      action: PayloadAction<{
        remoteHash?: string;
        localHash?: string;
        name?: string;
        directory?: string;
        branch?: string;
        diff?: FileEntry[];
        staged?: FileEntry[];
        remoteUrl?: string;
        commitcount?: number;
        contributorsCount?: number;
      }>,
    ) => {
      state.remoteHash = action.payload.remoteHash ?? state.remoteHash;
      state.localHash = action.payload.localHash ?? state.localHash;
      state.name = action.payload.name ?? state.name;
      state.directory = action.payload.directory ?? state.directory;
      state.branch = action.payload.branch ?? state.branch;
      state.diff = action.payload.diff ?? state.diff;
      state.staged = action.payload.staged ?? state.staged;
      state.remoteUrl = action.payload.remoteUrl ?? state.remoteUrl;
      state.commitcount = action.payload.commitcount ?? state.commitcount;
      state.contributorsCount = action.payload.contributorsCount ?? state.contributorsCount;
    },
    removeRepo: (state) => {
      state.remoteHash = "";
      state.localHash = "";
      state.name = "";
      state.directory = "";
      state.branch = "";
      state.diff = [];
      state.staged = [];
      state.remoteUrl = "";
      state.commitcount = 0;
      state.contributorsCount = 0;
    },
  },
});

export const { setRepo, removeRepo } = repoSlice.actions;
export default repoSlice.reducer;
