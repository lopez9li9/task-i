import { Schema, model, Types } from 'mongoose';

import { IGame } from '../interfaces/models.interfaces';

const gameSchema = new Schema<IGame>({
  name: { type: String, required: true, unique: true },
  teams: { type: [Types.ObjectId], ref: 'Team', default: [] },
  stage: { type: Types.ObjectId, ref: 'Stage', required: true },
  winner: { type: Types.ObjectId, ref: 'Team', required: false, default: null },
  loser: { type: Types.ObjectId, ref: 'Team', required: false, default: null },
  game_date: { type: String, required: true },
  status: { type: Boolean, default: true },
});

export default model<IGame>('Game', gameSchema);
