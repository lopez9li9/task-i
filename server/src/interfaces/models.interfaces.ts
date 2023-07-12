import { Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  permissions: string[];
  isDeleted: boolean;
}

export interface IRoleGame extends Document {
  name: string;
  position: string;
  description: string;
  isDeleted: boolean;
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: IRole['id'];
  roleGame: IRoleGame['id'] | null;
  team: ITeam['id'] | null;
}

export interface IStage extends Document {
  name: string;
  teams: ITeam['id'][] | [];
  isDeleted: boolean;
}

export interface IGame extends Document {
  name: string;
  teams: ITeam['id'][] | [];
  stage: IStage['id'];
  winner: ITeam['id'] | null;
  loser: ITeam['id'] | null;
  game_date: string;
  isDeleted: boolean;
}

export interface ITeam extends Document {
  name: string;
  members: IUser['id'][] | [];
  games_played: IGame['id'][] | [];
  stage: IStage['id'] | null;
  score: number;
  position: number;
  isDeleted: boolean;
}
