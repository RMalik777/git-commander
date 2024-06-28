import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import repoReducer from "./repoSlice";
import dirReducer from "./dirSlice";

export default configureStore({
  reducer: {
    user: userReducer,
    repo: repoReducer,
    dir: dirReducer,
  },
});
