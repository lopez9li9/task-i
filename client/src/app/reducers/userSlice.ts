import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { fetchUsers } from "../actions/userActions";
import { RootState, UserState } from "../../interfaces/appInterfaces";
import { User } from "../../interfaces/modelsInterfaces";

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

const user = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action: PayloadAction<unknown, string>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default user.reducer;
export const selectUsers = (state: RootState) => state.user.users;
