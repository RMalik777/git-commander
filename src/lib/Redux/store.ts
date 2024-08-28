import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import repoReducer from "./repoSlice";
import pullMsgReducer from "./pullMsg";
import fileReducer from "./fileList";
import gitReducer from "./gitSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    repo: repoReducer,
    pullMsg: pullMsgReducer,
    fileList: fileReducer,
    git: gitReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
