import { Router } from 'express';

import { getUser, createUser } from '../controllers/user.controller';

const userRoutes: Router = Router();

userRoutes.get('/', getUser);
userRoutes.post('/', createUser);

export default userRoutes;
