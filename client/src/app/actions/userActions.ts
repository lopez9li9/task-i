import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "../../conf/axiosConf";

import { User } from "../../interfaces/modelsInterfaces";
import { FetchOptionsParams } from "../../interfaces/appInterfaces";

export const fetchUsers = createAsyncThunk<User[], FetchOptionsParams, { rejectValue: string }>("user/fetchUsers", async ({ options }, thunkAPI) => {
  try {
    console.log(`/user${options && `?name=${options}`}`);
    const response = await api.get(`/user${options && `?name=${options}`}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue("Error message");
  }
});
