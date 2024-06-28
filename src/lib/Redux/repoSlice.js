import { createSlice } from "@reduxjs/toolkit";

export const repoSlice = createSlice({
  name: "repo",
  initialState: {
    value: localStorage.getItem("currentRepoName") || "",
  },
  reducers: {
    setRepo: (state, action) => {
      state.value = action.payload;
    },
    removeRepo: (state) => {
      state.value = "";
    },
  },
});

export const { setRepo, removeRepo } = repoSlice.actions;
export default repoSlice.reducer;
