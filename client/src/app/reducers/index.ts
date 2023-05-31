import { combineReducers, Reducer } from "@reduxjs/toolkit";

import theme from "./themeSlice";
import user from "./userSlice";

import { RootState } from "../../interfaces/appInterfaces";

const rootReducer: Reducer<RootState> = combineReducers<RootState>({
  theme,
  user,
});

export default rootReducer;
