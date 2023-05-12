import { Schema, model, Types } from 'mongoose';

import { ITeam } from '../interfaces/models.interfaces';

const teamSchema = new Schema<ITeam>({
  name: { type: String, required: true, unique: true },
  members: { type: [Types.ObjectId], ref: 'User', required: true },
  score: { type: Number, required: true },
  position: { type: Number, required: true },
  stage: { type: Types.ObjectId, ref: 'Stage', required: true },
  games_played: { type: [Types.ObjectId], ref: 'Game', required: true },
  status: { type: Boolean, default: true },
});

export default model<ITeam>('Team', teamSchema);
