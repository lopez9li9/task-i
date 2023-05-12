import { NextFunction, Request, Response } from 'express';

import Team from '../models/team.model';
import Stage from '../models/stage.model';

import { arraysEqual } from '../utils';
import { BadRequest, Conflict, NotFound } from '../helpers/custom.errors';
import { IStage, ITeam } from '../interfaces/models.interfaces';

export const getTeam = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name, stage } = request.query;
    let query: any = {};

    if (name) {
      query = { name: { $regex: name.toString(), $options: 'i' } };
    }

    if (stage) {
      const existingStage: IStage | null = await Stage.findOne({ name: stage.toString(), status: true });
      if (!existingStage) throw new NotFound('Stage not found');
      query.stage = existingStage._id;
    }

    query.status = { $ne: false };

    const teams: ITeam[] = await Team.find(query).populate('stage', 'name');

    if (!teams.length) {
      throw new NotFound(name ? `Team with name ${name} not found` : 'Teams not found');
    }

    response.status(200).json(teams);
  } catch (error) {
    next(error);
  }
};

export const createTeam = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name, members, score, position, stage, games_played } = request.body;
    if (!name || !members || !score || !position || !stage || !games_played) throw new BadRequest('All fields are required');

    const existingName: ITeam | null = await Team.findOne({ name, status: true });
    if (existingName) throw new Conflict('Team already exists');

    /** add controller for members */

    const existingStage: IStage | null = await Stage.findOne({ name: stage, status: true });
    if (!existingStage) throw new NotFound('Stage not found');

    /** add controller for games_played */

    const team: ITeam = new Team({ name, members, score, position, stage, games_played, status: true });
    await team.save();

    response.status(201).json(team);
  } catch (error) {
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
