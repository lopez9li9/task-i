import { Team, User } from "./modelsInterfaces";

export interface ThemeState {
  theme: string;
}

export interface UserState {
  users: null | User[];
  loading: boolean;
  error: string | null | unknown;
}

export interface TeamState {
  teams: null | Team[];
  loading: boolean;
  error: string | null | unknown;
}

export interface FetchOptionsParams {
  options: string;
}

export interface RootState {
  theme: ThemeState;
  user: UserState;
  team: TeamState;
}
