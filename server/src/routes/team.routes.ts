import { Router } from 'express';

import { getTeam, createTeam, updateTeam, deleteTeam } from '../controllers/team.controller';

const teamRoutes: Router = Router();

teamRoutes.get('/', getTeam);
teamRoutes.post('/', createTeam);
teamRoutes.put('/:id', updateTeam);
teamRoutes.delete('/:id', deleteTeam);

export default teamRoutes;
