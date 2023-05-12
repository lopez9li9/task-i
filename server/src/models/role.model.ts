import { Schema, model } from 'mongoose';

import { IRole } from '../interfaces/models.interfaces';

const roleSchema = new Schema<IRole>({
  name: { type: String, required: true, unique: true },
  permissions: { type: [String], required: true },
  status: { type: Boolean, default: true },
});

export default model<IRole>('Role', roleSchema);
