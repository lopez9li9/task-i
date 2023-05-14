import { NextFunction, Request, Response } from 'express';

import Game from '../models/game.model';
import Stage from '../models/stage.model';
import Team from '../models/team.model';

import { BadRequest, Conflict, NotFound } from '../helpers/custom.errors';
import { IGame, ITeam } from '../interfaces/models.interfaces';
import { isValidDateFormat } from '../utils';

export const getGame = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name } = request.query;

    let query: any = name && { name: { $regex: name.toString(), $options: 'i' } };

    const games: IGame[] = await Game.find(query).populate('teams').populate('stage').populate('winner').populate('loser');
    if (!games.length) throw new NotFound(name ? `Game with name ${name} not found` : 'Games not found');

    const formattedGames: Partial<IGame>[] = games.map((game: IGame) => {
      const formattedGame: Partial<IGame> = {
        id: game._id,
        name: game.name,
        teams: game.teams.map((team: ITeam) => team.name),
        stage: game.stage ? game.stage.name : null,
        winner: game.winner ? game.winner.name : null,
        loser: game.loser ? game.loser.name : null,
        game_date: game.game_date,
        isDeleted: game.isDeleted,
      };

      return formattedGame;
    });

    response.status(200).json(formattedGames);
  } catch (error) {
    next(error);
  }
};

export const createGame = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name, teams, stage, winner, loser, game_date } = request.body;

    if (!name && !stage && !game_date) throw new BadRequest('Name, stage, and game_data are required');

    const existingName = await Game.findOne({ name });
    if (existingName) throw new Conflict(`Game with name ${name} already exists`);

    const teamsIds: ITeam['id'][] = [];
    if (Array.isArray(teams) && teams.length > 0) {
      for (const team of teams) {
        const existingTeam = await Team.findOne({ name: team });

        if (!existingTeam) throw new Conflict(`Team with name ${team} does not exist`);

        teamsIds.push(existingTeam._id);
      }
    }

    const stageId = await Stage.findOne({ name: stage });
    if (!stageId) throw new Conflict(`Stage with name ${stage} does not exist`);

    let winnerId = null;
    if (winner) {
      const existingWinner = await Team.findOne({ name: winner });

      if (!existingWinner) throw new Conflict(`Team with name ${winner} does not exist`);

      winnerId = existingWinner._id;
    }

    let loserId = null;
    if (loser) {
      const existingLoser = await Team.findOne({ name: loser });
      if (!existingLoser) throw new Conflict(`Team with name ${loser} does not exist`);

      loserId = existingLoser._id;
    }

    if (isValidDateFormat(game_date)) throw new BadRequest('Invalid date format (DD/MM/YYYY - HH:MM)');

    const newGame = new Game({ name, teams: teamsIds, stage: stageId._id, winner: winnerId, loser: loserId, game_date });
    await newGame.save();

    await Team.updateMany({ _id: { $in: teamsIds } }, { $push: { games_played: newGame._id } });

    response.status(201).json(newGame);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const updateGame = async (request: Request, response: Response, next: NextFunction) => {
  try {
    response.status(200).json({ message: 'updateGame' });
  } catch (error) {
    next(error);
  }
};

export const deleteGame = async (request: Request, response: Response, next: NextFunction) => {
  try {
    response.status(200).json({ message: 'deleteGame' });
  } catch (error) {
    next(error);
  }
};
