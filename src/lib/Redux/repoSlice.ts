import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface RepoState {
  name: string;
  directory: string;
  branch: string;
  diff: string[];
  staged: string[];
}
const initialState: RepoState = {
  name: localStorage.getItem("currentRepoName") ?? "",
  directory: localStorage.getItem("repoDir") ?? "",
  branch: "",
  diff: [],
  staged: [],
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
        diff?: string[];
        staged?: string[];
      }>
    ) => {
      state.name = action.payload.name ?? state.name;
      state.directory = action.payload.directory ?? state.directory;
      state.branch = action.payload.branch ?? state.branch;
      state.diff = action.payload.diff ?? state.diff;
      state.staged = action.payload.staged ?? state.staged;
    },
    setDiff: (state, action: PayloadAction<string[]>) => {
      state.diff = state.diff.filter((item) => !action.payload.includes(item));
    },
    setStaged: (state, action: PayloadAction<string[]>) => {
      state.staged = state.staged.filter(
        (item) => !action.payload.includes(item)
      );
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

export const { setRepo, setDiff, setStaged, removeRepo } = repoSlice.actions;
export default repoSlice.reducer;
