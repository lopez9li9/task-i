import { Schema, model, Types } from 'mongoose';

import { IGame } from '../interfaces/models.interfaces';

const gameSchema = new Schema<IGame>({
  name: { type: String, required: true, unique: true },
  teams: { type: [Types.ObjectId], ref: 'Team', default: [] },
  stage: { type: Types.ObjectId, ref: 'Stage', required: true },
  winner: { type: Types.ObjectId, ref: 'Team', required: true },
  loser: { type: Types.ObjectId, ref: 'Team', required: true },
  game_date: { type: Date, required: true },
  status: { type: Boolean, default: true },
});

export default model<IGame>('Game', gameSchema);
