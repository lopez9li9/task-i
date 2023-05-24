import { combineReducers, Reducer } from "@reduxjs/toolkit";

import theme from "./themeSlice";

import { RootState } from "../../interfaces/appInterfaces";

const rootReducer: Reducer<RootState> = combineReducers<RootState>({
  theme,
});

export default rootReducer;
