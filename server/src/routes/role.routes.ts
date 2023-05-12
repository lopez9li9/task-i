import { Router } from 'express';

import { getRoles, createRole, updateRole, deleteRole } from '../controllers/role.controller';

const roleRoutes: Router = Router();

roleRoutes.get('/', getRoles);
roleRoutes.post('/', createRole);
roleRoutes.put('/:id', updateRole);
roleRoutes.delete('/:id', deleteRole);

export default roleRoutes;
