import { Schema, model, Types } from 'mongoose';

import { IStage } from '../interfaces/models.interfaces';

const stageSchema = new Schema<IStage>({
  name: { type: String, required: true, unique: true },
  teams: { type: [Types.ObjectId], ref: 'Team', default: [] },
  status: { type: Boolean, default: true },
});

export default model<IStage>('Stage', stageSchema);
