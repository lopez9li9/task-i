import { Router } from 'express';

import { getUser, createUser, updateUser, deleteUser } from '../controllers/user.controller';

const userRoutes: Router = Router();

userRoutes.get('/', getUser);
userRoutes.post('/', createUser);
userRoutes.put('/:id', updateUser);
userRoutes.delete('/:id', deleteUser);

export default userRoutes;
