import { Schema, model } from 'mongoose';

import { IRoleGame } from '../interfaces/models.interfaces';

const roleGameSchema = new Schema<IRoleGame>({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  position: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
});

export default model<IRoleGame>('RoleGame', roleGameSchema);
