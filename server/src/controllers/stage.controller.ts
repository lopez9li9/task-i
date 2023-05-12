import { NextFunction, Request, Response } from 'express';

import Stage from '../models/stage.model';

import { BadRequest, Conflict, NotFound } from '../helpers/custom.errors';
import { IStage } from '../interfaces/models.interfaces';

export const getStage = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name } = request.query;
    let query: any = {};

    if (name) {
      query = { name: { $regex: name.toString(), $options: 'i' } };
    }

    query.status = { $ne: false };

    const stages: IStage[] = await Stage.find(query).populate('team', 'name');

    if (!stages.length) {
      throw new NotFound(name ? `Stage with name ${name} not found` : 'Stages not found');
    }

    response.status(200).json(stages);
  } catch (error) {
    next(error);
  }
};

export const createStage = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name, teams } = request.body;

    if (!name || !teams) throw new BadRequest('Name and teams are required');

    const existingStage: IStage | null = await Stage.findOne({ name, status: true });

    if (existingStage) throw new Conflict(`Stage with name ${name} already exists`);

    const stage: IStage = new Stage({ name, teams, status: true });
    await stage.save();

    response.status(201).json(stage);
  } catch (error) {
    next(error);
  }
};

export const updateStage = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params;

    if (!id) throw new BadRequest('Id is required');

    const { name, teams } = request.body;

    if (!name || !teams) throw new BadRequest('At least one field is required');

    const stage: IStage | null = await Stage.findOne({ id, status: true });

    if (!stage) throw new NotFound('Stage not found');

    if (name === stage.name) throw new Conflict('Name cannot be the same');

    name && (stage.name = name);

    if (teams.length === stage.teams.length && teams.every((team: string) => stage.teams.includes(team))) {
      throw new Conflict('Teams cannot be the same');
    }

    teams && (stage.teams = teams);

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

    stage.status = false;
    await stage.save();

    return response.status(200).json({ message: 'Stage deleted' });
  } catch (error) {
    next(error);
  }
};
