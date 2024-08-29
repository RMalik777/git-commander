import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CommitFormat {
  hash: string;
  date: string;
  author: string;
  message: string;
}
export interface GitState {
  lastCommitMessage: string;
  waitingPush: CommitFormat[];
}

const initialState: GitState = {
  lastCommitMessage: "",
  waitingPush: [],
};

export const gitSlice = createSlice({
  name: "git",
  initialState,
  reducers: {
    setLastCommitMessage: (state, action: PayloadAction<string>) => {
      state.lastCommitMessage = action.payload;
    },
    setWaitingPush: (state, action: PayloadAction<CommitFormat[]>) => {
      state.waitingPush = action.payload;
    },
    removeLastCommitMessage: (state) => {
      state.lastCommitMessage = "";
    },
    removeWaitingPush: (state) => {
      state.waitingPush = [];
    },
  },
});

export const { setLastCommitMessage, removeLastCommitMessage, setWaitingPush, removeWaitingPush } =
  gitSlice.actions;
export default gitSlice.reducer;
