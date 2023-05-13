import { Schema, model, Types } from 'mongoose';

import { IUser } from '../interfaces/models.interfaces';

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: Types.ObjectId, ref: 'Role', required: true },
  team: { type: Types.ObjectId, ref: 'Team', default: null },
  status: { type: Boolean, default: true },
});

export default model<IUser>('User', userSchema);
