import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PullMsgState {
  tagBranch: string;
  changes: string;
  filesChanged: number;
  insertions: number;
  deletions: number;
}

const initialState: PullMsgState = {
  tagBranch: "",
  changes: "",
  filesChanged: 0,
  insertions: 0,
  deletions: 0,
};

export const pullMsgSlice = createSlice({
  name: "pullMsg",
  initialState,
  reducers: {
    setPullMsg: (
      state,
      action: PayloadAction<{
        tagBranch?: string;
        changes?: string;
        filesChanged?: number;
        insertions?: number;
        deletions?: number;
      }>,
    ) => {
      state.tagBranch = action.payload.tagBranch ?? state.tagBranch;
      state.changes = action.payload.changes ?? state.changes;
      state.filesChanged = action.payload.filesChanged ?? state.filesChanged;
      state.insertions = action.payload.insertions ?? state.insertions;
      state.deletions = action.payload.deletions ?? state.deletions;
    },
    removePullMsg: (state) => {
      state.tagBranch = "";
      state.changes = "";
      state.filesChanged = 0;
      state.insertions = 0;
      state.deletions = 0;
    },
  },
});

export const { setPullMsg, removePullMsg } = pullMsgSlice.actions;
export default pullMsgSlice.reducer;
