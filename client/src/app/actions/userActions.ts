import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "../../conf/axiosConf";

import { User } from "../../interfaces/modelsInterfaces";
import { FetchProductsParams } from "../../interfaces/appInterfaces";

export const fetchUsers = createAsyncThunk<User[], FetchProductsParams, { rejectValue: string }>("user/fetchUsers", async ({ options }, thunkAPI) => {
  try {
    console.log(`/user${options && `?name=${options}`}`);
    const response = await api.get(`/user${options && `?name=${options}`}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue("error message");
  }
});
