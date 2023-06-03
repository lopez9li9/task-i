export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  roles: string[];
  roleGames: string[] | null;
  teams: string[] | null;
  isDeleted: boolean;
}

export interface Team {
  id: string;
  name: string;
  members: string[] | [];
  games_played: string[] | [];
  stage: string | null;
  score: number;
  position: number;
}
