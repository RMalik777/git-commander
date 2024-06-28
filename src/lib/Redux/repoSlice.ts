import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface RepoState {
  value: string;
}
const initialState: RepoState = {
  value: localStorage.getItem("currentRepoName") ?? "",
};

export const repoSlice = createSlice({
  name: "repo",
  initialState,
  reducers: {
    setRepo: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
    removeRepo: (state) => {
      state.value = "";
    },
  },
});

export const { setRepo, removeRepo } = repoSlice.actions;
export default repoSlice.reducer;
