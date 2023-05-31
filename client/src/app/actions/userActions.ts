import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../conf/axiosConf";
import { User } from "../../interfaces/modelsInterfaces";

export interface FetchProductsParams {
  options: string;
}

export const fetchUsers = createAsyncThunk<User[], FetchProductsParams, { rejectValue: string }>("user/fetchUsers", async ({ options }, thunkAPI) => {
  try {
    console.log(options);
    const response = options ? await api.get(`/user?name=${options}`) : await api.get("/user");
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue("error message");
  }
});
