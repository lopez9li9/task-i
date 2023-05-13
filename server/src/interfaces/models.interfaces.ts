import { Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  permissions: string[];
  status: boolean;
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: IRole['id'];
  team: ITeam['id'] | null;
  status: boolean;
}

export interface IStage extends Document {
  name: string;
  teams: ITeam['id'][] | [];
  status: boolean;
}

export interface IGame extends Document {
  name: string;
  teams: ITeam['id'][] | [];
  stage: IStage['id'];
  winner: ITeam['id'] | '';
  loser: ITeam['id'] | '';
  game_date: Date;
  status: boolean;
}

export interface ITeam extends Document {
  name: string;
  members: IUser['id'][] | [];
  games_played: IGame['id'][] | [];
  stage: IStage['id'] | null;
  score: number;
  position: number;
  status: boolean;
}
