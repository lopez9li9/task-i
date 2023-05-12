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
  status: boolean;
}

export interface IStage extends Document {
  name: string;
  teams: ITeam['id'][];
  status: boolean;
}

export interface IGame extends Document {
  name: string;
  stage: IStage['id'];
  teams: ITeam['id'][];
  winner: ITeam['id'];
  loser: ITeam['id'];
  game_date: Date;
  status: boolean;
}

export interface ITeam extends Document {
  name: string;
  members: IUser['id'][];
  score: number;
  position: number;
  stage: IStage['id'];
  games_played: IGame['id'][];
  status: boolean;
}
