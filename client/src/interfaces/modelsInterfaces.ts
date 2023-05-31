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
