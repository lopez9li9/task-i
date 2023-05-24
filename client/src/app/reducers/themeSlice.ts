import { createSlice } from "@reduxjs/toolkit";

import { setThemeReducer } from "../actions/themeActions";
import { ThemeState } from "../../interfaces/appInterfaces";

const initialState: ThemeState = {
  theme: localStorage.theme || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"),
};

const theme = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: setThemeReducer,
  },
});

export const { setTheme } = theme.actions;

export default theme.reducer;
