import { NextFunction, Request, Response } from 'express';

import Stage from '../models/stage.model';
import Team from '../models/team.model';

import { BadRequest, Conflict, NotFound } from '../helpers/custom.errors';
import { IStage, ITeam } from '../interfaces/models.interfaces';
import { arraysEqual } from '../utils';

export const getStage = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name } = request.query;
    let query: any = {};

    if (name) query = { name: { $regex: name.toString(), $options: 'i' } };

    const stages: IStage[] = await Stage.find(query).populate('teams');
    if (!stages.length) throw new NotFound(name ? `Stage with name ${name} not found` : 'Stages not found');

    const formattedStages: Partial<IStage>[] = stages.map((stage: IStage) => {
      const formattedStage: Partial<IStage> = {
        id: stage._id,
        name: stage.name,
        teams: stage.teams.map((team: ITeam) => team.name),
      };

      return formattedStage;
    });

    response.status(200).json(formattedStages);
  } catch (error) {
    next(error);
  }
};

export const createStage = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name, teams } = request.body;

    if (!name) throw new BadRequest('Name is required');

    const existingStage: IStage | null = await Stage.findOne({ name });
    if (existingStage) throw new BadRequest(`Stage with name ${name} already exists`);

    let teamsIds: ITeam['id'][] = [];
    if (Array.isArray(teams) && teams.length > 0) {
      for (const teamName of teams) {
        const team: ITeam | null = await Team.findOne({ name: teamName });
        if (!team) throw new NotFound(`Team with name ${teamName} not found`);

        teamsIds.push(team._id);
      }
    }

    const newStage: IStage = new Stage({ name, teams: teamsIds });
    await newStage.save();

    response.status(201).json(newStage);
  } catch (error) {
    next(error);
  }
};

export const updateStage = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params;
    if (!id) throw new BadRequest('Id is required');

    const stage: IStage | null = await Stage.findById(id);
    if (!stage) throw new NotFound('Stage not found');

    const { name, teams } = request.body;

    if (!name && !teams) throw new BadRequest('At least one field is required');

    if (name) {
      if (name === stage.name) throw new Conflict('Name cannot be the same');

      stage.name = name;
    }

    if (teams) {
      if (arraysEqual(teams, stage.teams)) throw new Conflict('Teams cannot be the same');

      stage.teams = teams;
    }

    await stage.save();

    response.status(200).json(stage);
  } catch (error) {
    next(error);
  }
};

export const deleteStage = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params;

    if (!id) throw new BadRequest('Id is required');

    const stage: IStage | null = await Stage.findOne({ _id: id, status: true });
    if (!stage) throw new NotFound('Stage not found');

    stage.isDeleted = false;
    await stage.save();

    return response.status(200).json({ message: 'Stage deleted' });
  } catch (error) {
    next(error);
  }
};
