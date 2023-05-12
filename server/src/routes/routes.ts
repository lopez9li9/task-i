import { Router } from 'express';

import roleRoutes from './role.routes';
import userRoutes from './user.routes';
import stageRoutes from './stage.routes';
import teamRoutes from './team.routes';

import { errorMiddleware } from '../middlewares/next.middleware';

const server: Router = Router();

server.use('/role', roleRoutes);
server.use('/user', userRoutes);
server.use('/stage', stageRoutes);
server.use('/team', teamRoutes);

server.use(errorMiddleware);

export default server;
