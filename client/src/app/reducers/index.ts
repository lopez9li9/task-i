/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyAction, combineReducers, Reducer } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";

import theme from "./themeSlice";
import user from "./userSlice";

import { RootState } from "../../interfaces/appInterfaces";

const rootReducer: Reducer<RootState> = combineReducers<RootState>({
  theme,
  user,
});

export default rootReducer;
export type AppState = ReturnType<typeof rootReducer>;

type TypedDispatch<T> = ThunkDispatch<T, any, AnyAction>;

export const useAppDispatch = () => useDispatch<TypedDispatch<AppState>>();

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;

/**
 * const dispatch = useAppDispatch();
 * const state = useAppSelector((state: AppState) => state.xxx);
 */
