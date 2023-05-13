import { Router } from 'express';

import { getRoleGame, createRole, updateRole, deleteRole } from '../controllers/roleGame.controller';

const roleGameRoutes = Router();

roleGameRoutes.get('/', getRoleGame);
roleGameRoutes.post('/', createRole);
roleGameRoutes.put('/:id', updateRole);
roleGameRoutes.delete('/:id', deleteRole);

export default roleGameRoutes;
