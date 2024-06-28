import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  value: string;
}
const initialState: UserState = {
  value: "",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
    removeUser: (state) => {
      state.value = "";
    },
  },
});

export const { setUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
