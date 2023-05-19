import { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongoose';

import Team from '../models/team.model';
import Stage from '../models/stage.model';

import { BadRequest, Conflict, NotFound } from '../helpers/custom.errors';
import { IGame, IStage, ITeam } from '../interfaces/models.interfaces';
import { arraysContains, arraysIntersect } from '../utils';

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

    await Team.updateMany({ _id: { $in: teamsIds } }, { stage: newStage._id });

    response.status(201).json(newStage);
  } catch (error) {
    next(error);
  }
};

export const updateStage = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params;
    if (!id) throw new BadRequest('Id is required');

    const existingStage: IStage | null = await Stage.findById(id).populate('teams', 'name');
    if (!existingStage) throw new NotFound('Stage not found');

    const updatedFields: Partial<IGame> = {};

    const name: string | undefined = request.body.name;
    if (name) {
      if (typeof name !== 'string') throw new BadRequest('Name must be a string');
      if (await Stage.findOne({ name, _id: { $ne: id } })) throw new Conflict(`Stage with name ${name} already exists`);
      if (name === existingStage.name) throw new Conflict('Name is the same');

      updatedFields.name = name;
    }

    const teams: { add: string[]; remove: string | string[] } = request.body.teams;
    if (teams) {
      const { add, remove }: any = teams;
      if (add && remove && Array.isArray(remove) && arraysIntersect(add, remove)) throw new BadRequest('Cannot add and remove the same member');

      const currentTeams: ObjectId[] | [] = existingStage.teams.map((team: ITeam) => team._id);
      const currentTeamsN: string[] | [] = existingStage.teams.map((team: ITeam) => team.name);
      if (add && Array.isArray(add) && arraysIntersect(currentTeamsN, add)) throw new Conflict('Cannot add the same team');
      if (remove && Array.isArray(remove) && !arraysContains(currentTeamsN, remove)) throw new Conflict('Invalid team, cannot remove');

      const removeTeams: ObjectId[] = [];
      if (remove) {
        if (typeof remove === 'string' && remove === 'all') {
          for (const teamID of currentTeams) if (!(await Team.findByIdAndUpdate(teamID, { stage: null }))) throw new NotFound('Team not found');

          currentTeams.splice(0, currentTeams.length);
        }

        if (Array.isArray(remove) && remove.length) {
          for (const name of remove) {
            const team: ITeam | null = await Team.findOne({ name });
            if (!team) throw new NotFound(`Team with name ${name} not found`);

            (removeTeams as ObjectId[]).push(team._id);
            if (team.stage !== null) await Team.findByIdAndUpdate(team._id, { stage: null });
          }

          const removeTeamsStr: string[] | [] = removeTeams.map((team: ObjectId) => team.toString());
          currentTeams.splice(0, currentTeams.length, ...currentTeams.filter((team) => !removeTeamsStr.includes(team.toString())));
        }
      }

      const addTeams: ObjectId[] = [];
      if (add) {
        if (!Array.isArray(add) || !add.length) throw new BadRequest('Add must be an array of strings');

        for (const name of add) {
          const team: ITeam | null = await Team.findOne({ name });
          if (!team) throw new NotFound(`Team with name ${name} not found`);
          if (team.stage !== null && !(await Stage.findByIdAndUpdate(team.stage, { $pull: { teams: team._id } })))
            throw new NotFound('Team in not associated with any stage');

          (addTeams as ObjectId[]).push(team._id);
          await Team.findByIdAndUpdate(team._id, { stage: existingStage._id });
        }
      }

      add ? (updatedFields.teams = [...currentTeams, ...addTeams]) : (updatedFields.teams = currentTeams);
    }

    if (!Object.keys(updatedFields).length) throw new Conflict('No fields to update');

    const updatedStage: IStage | null = await Stage.findByIdAndUpdate(id, updatedFields, { new: true });

    response.status(200).json(updatedStage);
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
