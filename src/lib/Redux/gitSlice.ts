import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface GitState {
  lastCommitMessage: string;
}

const initialState: GitState = {
  lastCommitMessage: "",
};

export const gitSlice = createSlice({
  name: "git",
  initialState,
  reducers: {
    setLastCommitMessage: (state, action: PayloadAction<string>) => {
      state.lastCommitMessage = action.payload;
    },
    removeLastCommitMessage: (state) => {
      state.lastCommitMessage = "";
    },
  },
});

export const { setLastCommitMessage, removeLastCommitMessage } = gitSlice.actions;
export default gitSlice.reducer;
