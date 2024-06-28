import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import repoReducer from "./repoSlice";
import dirReducer from "./dirSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    repo: repoReducer,
    dir: dirReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
