import { NextFunction, Request, Response } from 'express';

import Team from '../models/team.model';
import Stage from '../models/stage.model';
import User from '../models/user.model';
import Game from '../models/game.model';

import { BadRequest, Conflict, NotFound } from '../helpers/custom.errors';
import { IGame, IStage, ITeam, IUser } from '../interfaces/models.interfaces';
import { arraysContains, arraysIntersect } from '../utils';

export const getTeam = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name } = request.query;

    const query: any = name && { name: { $regex: name.toString(), $options: 'i' } };

    const teams: ITeam[] = await Team.find(query).populate('members').populate('games_played').populate('stage');
    if (!teams.length) throw new NotFound(name ? `Team with name ${name} not found` : 'Teams not found');

    const formattedTeams: Partial<ITeam>[] = teams.map((team: ITeam) => {
      const formattedTeam: Partial<ITeam> = {
        id: team._id,
        name: team.name,
        members: team.members.map((member: IUser) => member.username),
        games_played: team.games_played.map((game: IGame) => game.name),
        stage: team.stage ? team.stage.name : null,
        score: team.score,
        position: team.position,
        isDeleted: team.isDeleted,
      };

      return formattedTeam;
    });

    response.status(200).json(formattedTeams);
  } catch (error) {
    next(error);
  }
};

export const createTeam = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name, members, games_played, stage, score, position } = request.body;

    if (!name && !score && !position) throw new BadRequest('Name, members, score, and position are required');

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

    for (const memberId of membersIds) await User.findByIdAndUpdate(memberId, { team: newTeam._id });

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

    const existingTeam: ITeam | null = await Team.findById(id);
    if (!existingTeam) throw new NotFound('Team not found');

    const updatedFields: Partial<ITeam> = {};

    const name: string | undefined = request.body.name;
    if (name) {
      if (await Team.findOne({ name, _id: { $ne: id } })) throw new BadRequest('Name already exists');
      if (name === existingTeam.name) throw new Conflict('Name is the same');
      updatedFields.name = name;
    }

    const members: { add?: string[]; remove?: string[] | string } | undefined = request.body.members;
    if (members) {
      const { add, remove } = members;

      // Remove members
      if (remove) {
        if (remove === 'all') {
          if (!existingTeam.members.length) throw new Conflict('Team has no members');

          updatedFields.members = [];
          for (const member of existingTeam.members) {
            const user = await User.findById(member);
            if (!user) throw new BadRequest(`User not found: ${member}`);

            await User.findByIdAndUpdate(user._id, { team: null });
          }
        } else {
          if (!Array.isArray(remove)) throw new BadRequest('Invalid remove format');

          if (!arraysContains(existingTeam.members, remove)) throw new Conflict('Changes were not applied');

          for (const username of remove) {
            const user = await User.findOne({ username });
            if (!user) {
              throw new BadRequest(`User not found: ${username}`);
            }
            await User.findByIdAndUpdate(user._id, { team: null });
          }
          updatedFields.members = existingTeam.members.filter((member) => !remove.includes(member));
        }
      }

      // Add members
      if (add) {
        if (!Array.isArray(add)) throw new BadRequest('Invalid add format');

        if (arraysIntersect(existingTeam.members, add)) throw new Conflict('Changes were not applied');

        for (const username of add) {
          const user: IUser | null = await User.findOne({ username });
          if (!user) throw new BadRequest(`User not found: ${username}`);

          await User.findByIdAndUpdate(user._id, { team: existingTeam._id });
          if (updatedFields.members) {
            (updatedFields.members as string[]).push(user._id); // Explicit type annotation
          } else {
            updatedFields.members = [user._id] as string[]; // Explicit type annotation
          }
        }
      }
    }

    /** games_played */

    const stage: string | undefined = request.body.stage;
    if (stage) {
      if (stage === 'none') {
        if (!existingTeam.stage) throw new Conflict('User is not associated with any team');

        await Stage.findByIdAndUpdate(existingTeam.stage, { $pull: { teams: existingTeam._id } });
        updatedFields.stage = null;
      } else {
        const existingStage: IStage | null = await Stage.findOne({ name: stage });
        if (!existingStage) throw new NotFound('Stage does not exist');
        if (stage === existingTeam.stage) throw new Conflict('User is not associated with any team');
        if (existingTeam.stage) await Stage.findByIdAndUpdate(existingTeam.stage, { $pull: { teams: existingTeam._id } });

        await Stage.findByIdAndUpdate(existingStage._id, { $addToSet: { teams: existingTeam._id } });
        updatedFields.stage = existingStage._id;
      }
    }

    const score: number | undefined = request.body.score;
    if (score) {
      if (score === existingTeam.score) throw new Conflict('Score is the same');
      updatedFields.score = score;
    }

    const position: number | undefined = request.body.position;
    if (position) {
      if (position === existingTeam.position) throw new Conflict('Position is the same');
      updatedFields.position = position;
    }

    if (!Object.keys(updatedFields).length) throw new Conflict('No changes to update');

    const updatedTeam: ITeam | null = await Team.findByIdAndUpdate(id, updatedFields, { new: true });

    response.status(200).json(updatedTeam);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const deleteTeam = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params;

    if (!id) throw new BadRequest('Id is required');

    const team: ITeam | null = await Team.findOne({ id, status: true });

    if (!team) throw new NotFound('Team not found');

    team.isDeleted = false;
    await team.save();

    return response.status(200).json({ message: 'Team deleted' });
  } catch (error) {
    next(error);
  }
};
