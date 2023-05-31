import { User } from "./modelsInterfaces";

export interface ThemeState {
  theme: string;
}

export interface UserState {
  users: null | User[];
  loading: boolean;
  error: string | null | unknown;
}

export interface RootState {
  theme: ThemeState;
  user: UserState;
}
