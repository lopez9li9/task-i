import { configureStore, Store } from "@reduxjs/toolkit";

import reducer from "../reducers";

import { RootState } from "../../interfaces/appInterfaces";

export const store: Store<RootState> = configureStore({ reducer });
