import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CommitFormat {
  hash: string;
  date: string;
  author: string;
  message: string;
}
export interface GitState {
  lastCommitMessage: string;
  localCommit: CommitFormat[];
  remoteCommit: CommitFormat[];
}

const initialState: GitState = {
  lastCommitMessage: "",
  localCommit: [],
  remoteCommit: [],
};

export const gitSlice = createSlice({
  name: "git",
  initialState,
  reducers: {
    setLastCommitMessage: (state, action: PayloadAction<string>) => {
      state.lastCommitMessage = action.payload;
    },
    setLocalCommit: (state, action: PayloadAction<CommitFormat[]>) => {
      state.localCommit = action.payload;
    },
    setRemoteCommit: (state, action: PayloadAction<CommitFormat[]>) => {
      state.remoteCommit = action.payload;
    },
    removeLastCommitMessage: (state) => {
      state.lastCommitMessage = "";
    },
    removeLocalCommit: (state) => {
      state.localCommit = [];
    },
    removeCommitMessage: (state) => {
      state.remoteCommit = [];
    },
    removeAllGitAttr(state) {
      state.lastCommitMessage = "";
      state.localCommit = [];
      state.remoteCommit = [];
    },
  },
});

export const {
  setLastCommitMessage,
  removeLastCommitMessage,
  setLocalCommit,
  removeLocalCommit,
  setRemoteCommit,
  removeCommitMessage,
  removeAllGitAttr,
} = gitSlice.actions;
export default gitSlice.reducer;
