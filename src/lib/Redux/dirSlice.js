import { createSlice } from "@reduxjs/toolkit";

export const dirSlice = createSlice({
  name: "repo",
  initialState: {
    value: localStorage.getItem("repoDir") || "",
  },
  reducers: {
    setDir: (state, action) => {
      state.value = action.payload;
    },
    removeDir: (state) => {
      state.value = "";
    },
  },
});

export const { setDir, removeDir } = dirSlice.actions;
export default dirSlice.reducer;
