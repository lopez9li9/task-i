import { Router } from 'express';

import { getGame, createGame, updateGame, deleteGame } from '../controllers/game.controller';

const gameRoutes: Router = Router();

gameRoutes.get('/', getGame);
gameRoutes.post('/', createGame);
gameRoutes.put('/:id', updateGame);
gameRoutes.delete('/:id', deleteGame);

export default gameRoutes;
