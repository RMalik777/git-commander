import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface DirState {
  value: string;
}
const initialState: DirState = {
  value: "",
};

export const dirSlice = createSlice({
  name: "repo",
  initialState,
  reducers: {
    setDir: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
    removeDir: (state) => {
      state.value = "";
    },
  },
});

export const { setDir, removeDir } = dirSlice.actions;
export default dirSlice.reducer;
