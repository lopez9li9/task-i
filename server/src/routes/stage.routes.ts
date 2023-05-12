import { Router } from 'express';

import { getStage, createStage, updateStage, deleteStage } from '../controllers/stage.controller';

const stageRoutes: Router = Router();

stageRoutes.get('/', getStage);
stageRoutes.post('/', createStage);
stageRoutes.put('/:id', updateStage);
stageRoutes.delete('/:id', deleteStage);

export default stageRoutes;
