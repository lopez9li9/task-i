import { PayloadAction } from "@reduxjs/toolkit";

import { ThemeState } from "../../interfaces/appInterfaces";

export const setThemeReducer = (state: ThemeState, action: PayloadAction<string>) => {
  state.theme = action.payload;
  localStorage.theme = action.payload;
};
