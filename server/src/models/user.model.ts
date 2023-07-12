import { Schema, model, Types } from 'mongoose';

import { IUser } from '../interfaces/models.interfaces';

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: Types.ObjectId, ref: 'Role', required: true },
  roleGame: { type: Types.ObjectId, ref: 'RoleGame', required: false, default: null },
  team: { type: Schema.Types.Mixed, ref: 'Team', required: false, default: null },
});

export default model<IUser>('User', userSchema);
