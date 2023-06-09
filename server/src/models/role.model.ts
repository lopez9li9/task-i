import { Schema, model } from 'mongoose';

import { IRole } from '../interfaces/models.interfaces';

const roleSchema = new Schema<IRole>({
  name: { type: String, required: true, unique: true },
  permissions: { type: [String], required: true },
  isDeleted: { type: Boolean, default: false },
});

export default model<IRole>('Role', roleSchema);
