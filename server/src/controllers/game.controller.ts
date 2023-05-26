import { NextFunction, Request, Response } from 'express';

import Game from '../models/game.model';
import Stage from '../models/stage.model';
import Team from '../models/team.model';

import { BadRequest, Conflict, NotFound } from '../helpers/custom.errors';
import { IGame, ITeam } from '../interfaces/models.interfaces';
import { arraysIntersect, isValidDate } from '../utils';
import { ObjectId } from 'mongoose';

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

    if (!isValidDate(game_date)) throw new BadRequest('Invalid date format (DD/MM/YY - HH:MM)');

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
    const { id } = request.params;
    if (!id) throw new BadRequest('Id is required');

    const existingGame: IGame | null = await Game.findById(id)
      .populate('teams', 'name')
      .populate('stage', 'name')
      .populate('winner')
      .populate('loser');
    if (!existingGame) throw new NotFound(`Game with id ${id} not found`);

    const updatedFields: Partial<IGame> = {};

    const name: string | undefined = request.body.name;
    if (name) {
      if (typeof name !== 'string') throw new BadRequest('Name must be a string');
      if (await Game.findOne({ name, _id: { $ne: id } })) throw new NotFound(`Game with name ${name} already exists`);
      if (name === existingGame.name) throw new BadRequest(`Name is the same as the current one`);

      updatedFields.name = name;
    }

    const teams: { add: string[]; remove: string | string[] } | undefined = request.body.teams;
    if (teams) {
      const { add, remove } = teams;
      if (Array.isArray(add) && Array.isArray(remove) && arraysIntersect(add, remove)) throw new BadRequest('Invalid teams array');

      const currentTeams: ObjectId[] | [] = existingGame.teams.map((team: ITeam) => team._id);
      const currentTeamsName: string[] | [] = existingGame.teams.map((team: ITeam) => team.name);
      if (remove) {
        if (typeof remove === 'string' && remove === 'all') {
          console.log(existingGame.teams);
        }
        if (Array.isArray(remove)) {
          if (!remove.length) throw new BadRequest('Empty array');
        }
      }

      const addTeams: ObjectId[] | [] = [];
      if (add) {
        if (!Array.isArray(add)) throw new BadRequest('Add value must be an array');
        if (arraysIntersect(currentTeamsName, add)) throw new BadRequest('Add value must');
        for (const name of add) {
          const team: ITeam | null = await Team.findOne({ name });
          if (!team) throw new NotFound('Team not found');
          (addTeams as ObjectId[]).push(team._id);
          await Team.findByIdAndUpdate(team._id, { $addToSet: { games_played: existingGame._id } });
        }
        console.log(addTeams);
      }

      updatedFields.teams = add ? [currentTeams, addTeams] : currentTeams;
      //add ? (updatedFields.teams = [currentTeams, addTeams]) : (updatedFields.teams = currentTeams);
    }

    const stage: string | null = request.body.stage;
    if (stage) {
      const existingStage = await Stage.findOne({ name: stage }).populate('teams');
      if (!existingStage) throw new NotFound(`Stage with name ${stage} does not exist`);
      if (stage === existingGame.stage.name) throw new BadRequest(`Stage is the same as the current one`);

      updatedFields.stage = existingStage._id;

      const gameTeamsIds = existingGame.teams.map((team) => team._id.toString());
      const newTeamIds = gameTeamsIds.filter((teamId) => !existingStage.teams.some((stageTeam) => stageTeam._id.toString() === teamId));

      await Stage.findByIdAndUpdate(existingStage._id, { $addToSet: { teams: { $each: newTeamIds } } });
    }

    /** winner and loser" ObjectId => Team ------> dependent of teams*/

    const game_date: string | undefined = request.body.game_date;
    if (game_date) {
      if (typeof game_date !== 'string') throw new BadRequest('Invalid date format');
      if (game_date === existingGame.game_date) throw new BadRequest(`Date is the same as the current one`);
      if (!isValidDate(game_date)) throw new BadRequest('Invalid date format (DD/MM/YY - HH:MM)');

      updatedFields.game_date = game_date;
    }

    if (!Object.keys(updatedFields).length) throw new BadRequest('No fields to update');

    const updatedGame: IGame | null = await Game.findByIdAndUpdate(id, updatedFields, { new: true });

    response.status(200).json(updatedGame);
  } catch (error) {
    console.log(error);
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
