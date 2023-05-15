import { Router } from 'express';

import { getRoleGame, createRoleGame, updateRoleGame, deleteRoleGame } from '../controllers/roleGame.controller';

const roleGameRoutes = Router();

roleGameRoutes.get('/', getRoleGame);
roleGameRoutes.post('/', createRoleGame);
roleGameRoutes.put('/:id', updateRoleGame);
roleGameRoutes.delete('/:id', deleteRoleGame);

export default roleGameRoutes;
