import { NextFunction, Request, Response } from 'express';

import Team from '../models/team.model';
import Stage from '../models/stage.model';
import User from '../models/user.model';
import Game from '../models/game.model';

import { arraysEqual } from '../utils';
import { BadRequest, Conflict, NotFound } from '../helpers/custom.errors';
import { IGame, IStage, ITeam, IUser } from '../interfaces/models.interfaces';

export const getTeam = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name, stage } = request.query;
    let query: any = {};

    if (name) query = { name: { $regex: name.toString(), $options: 'i' } };

    if (stage) {
      const existingStage: IStage | null = await Stage.findOne({ name: stage.toString(), status: true });
      if (!existingStage) throw new NotFound('Stage not found');
      query.stage = existingStage._id;
    }

    query.status = { $ne: false };

    const teams: ITeam[] = await Team.find(query);

    if (!teams.length) throw new NotFound(name ? `Team with name ${name} not found` : 'Teams not found');

    response.status(200).json(teams);
  } catch (error) {
    next(error);
  }
};

export const createTeam = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name, members, games_played, stage, score, position } = request.body;

    if (!name || !score || !position) throw new BadRequest('Name, members, score, and position are required');

    const existingName: ITeam | null = await Team.findOne({ name });
    if (existingName) throw new BadRequest(`Team with name ${name} already exists`);

    const membersIds: IUser['id'][] = [];

    if (Array.isArray(members) && members.length > 0) {
      for (const memberName of members) {
        const member = await User.findOne({ username: memberName });

        if (!member) throw new NotFound(`User with ID ${memberName} not found`);

        membersIds.push(member._id);
      }
    }

    const games_playedIds: IGame['id'][] = [];

    if (Array.isArray(games_played) && games_played.length > 0) {
      for (const gameName of games_played) {
        const game = await Game.findOne({ name: gameName });

        if (!game) throw new NotFound(`Game with ID ${gameName} not found`);

        games_playedIds.push(game._id);
      }
    }

    let stageId = null;
    if (stage) {
      const existingStage: IStage | null = await Stage.findOne({ name: stage });
      if (!existingStage) throw new NotFound('Stage not found');

      stageId = existingStage._id;
    }

    const newTeam: ITeam = new Team({ name, members: membersIds, games_played: games_playedIds, stage: stageId, score, position });

    await newTeam.save();
    response.status(201).json(newTeam);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const updateTeam = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params;

    if (!id) throw new BadRequest('Id is required');

    const team: ITeam | null = await Team.findOne({ id, status: true });

    if (!team) throw new NotFound('Team not found');

    const { name, members, score, position, stage, games_played } = request.body;

    if (name === team.name) throw new Conflict('Name already exists');
    name && (team.name = name);

    if (arraysEqual(members, team.members)) throw new Conflict('Members already exists');
    members && (team.members = members);

    if (score === team.score) throw new Conflict('Score already exists');
    score && (team.score = score);

    if (position === team.position) throw new Conflict('Position already exists');
    position && (team.position = position);

    const existingStage: IStage | null = await Stage.findOne({ name: stage, status: true });
    if (!existingStage) throw new Conflict('Stage not found');
    stage && (team.stage = existingStage.id);

    if (arraysEqual(games_played, team.games_played)) throw new Conflict('Games played already exists');
    games_played && (team.games_played = games_played);

    await team.save();
    response.status(200).json(team);
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params;

    if (!id) throw new BadRequest('Id is required');

    const team: ITeam | null = await Team.findOne({ id, status: true });

    if (!team) throw new NotFound('Team not found');

    team.status = false;
    await team.save();

    return response.status(200).json({ message: 'Team deleted' });
  } catch (error) {
    next(error);
  }
};
