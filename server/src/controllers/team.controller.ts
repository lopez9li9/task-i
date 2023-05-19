import { NextFunction, Request, Response } from 'express';

import Team from '../models/team.model';
import Stage from '../models/stage.model';
import User from '../models/user.model';
import Game from '../models/game.model';

import { BadRequest, Conflict, NotFound } from '../helpers/custom.errors';
import { IGame, IStage, ITeam, IUser } from '../interfaces/models.interfaces';
import { arraysContains, arraysIntersect } from '../utils';
import { ObjectId } from 'mongoose';

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

    const existingTeam: ITeam | null = await Team.findById(id).populate('members', 'username').populate('games_played');
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
      const { add, remove }: any = members;
      if (add && remove && typeof remove !== 'string' && arraysIntersect(add, remove)) throw new BadRequest('Cannot add and remove the same member');

      const currentMembers: ObjectId[] | [] = existingTeam.members.map((member: IUser) => member._id);
      const currentMemberUsername: string[] | [] = existingTeam.members.map((member: IUser) => member.username);
      if (add && Array.isArray(add) && arraysIntersect(currentMemberUsername, add)) throw new Conflict('Invalid member, already added');
      if (remove && Array.isArray(remove) && !arraysContains(currentMemberUsername, remove)) throw new Conflict('Invalid member, already removed');

      const removeMembers: ObjectId[] = [];
      if (remove) {
        if (typeof remove === 'string' && remove === 'all') {
          for (const memberID of currentMembers) if (!(await User.findByIdAndUpdate(memberID, { team: null }))) throw new NotFound('User not found');

          currentMembers.splice(0, currentMembers.length);
        }

        if (Array.isArray(remove) && remove.length) {
          for (const username of remove) {
            const member: IUser | null = await User.findOne({ username });
            if (!member) throw new NotFound(`User with ID ${username} not found`);

            (removeMembers as ObjectId[]).push(member._id);
            if (member.team !== null) await User.findByIdAndUpdate(member._id, { team: null });
          }

          const removeMembersStrings = removeMembers.map((member) => member.toString());
          currentMembers.splice(0, currentMembers.length, ...currentMembers.filter((member) => !removeMembersStrings.includes(member.toString())));
        }
      }

      const addMembers: ObjectId[] = [];
      if (add) {
        if (!Array.isArray(add) || !add.length) throw new BadRequest('Invalid add value');

        for (const username of add) {
          const member: IUser | null = await User.findOne({ username });
          if (!member) throw new NotFound(`User with username ${username} not found`);
          if (member.team !== null && !(await Team.findByIdAndUpdate(member.team, { $pull: { members: member._id } })))
            throw new NotFound('User is not associated with any team');

          (addMembers as ObjectId[]).push(member._id);
          await User.findByIdAndUpdate(member._id, { team: existingTeam._id });
        }
      }

      add ? (updatedFields.members = [...currentMembers, ...addMembers]) : (updatedFields.members = currentMembers);
    }

    const gamesPlayed: { add?: string[]; remove?: string[] | string } | undefined = request.body.games_played;
    if (gamesPlayed) {
      const { add, remove }: any = gamesPlayed;
      if (add && remove && typeof remove !== 'string' && arraysIntersect(add, remove)) throw new BadRequest('Cannot add and remove the same game');

      const currentGamesP: ObjectId[] | [] = existingTeam.games_played.map((game: IGame) => game._id);
      const currentGamesPName: string[] | [] = existingTeam.games_played.map((game: IGame) => game.name);
      if (add && Array.isArray(add)) {
        if (arraysIntersect(currentGamesPName, add)) throw new Conflict('Invalid game, already added');
        if (currentGamesP.length === 2 || currentGamesP.length + add.length > 2) throw new Conflict('Invalid game, already added 2 games');
      }
      if (remove && Array.isArray(remove) && !arraysContains(currentGamesPName, remove)) throw new Conflict('Invalid game, already removed');

      const removeGamesPlayed: ObjectId[] = [];
      if (remove) {
        if (typeof remove === 'string' && remove === 'all') {
          for (const gameID of currentGamesP)
            if (!(await Game.findByIdAndUpdate(gameID, { $pull: { teams: existingTeam._id } }))) throw new NotFound('Game not found');

          currentGamesP.splice(0, currentGamesP.length);
        }

        if (Array.isArray(remove) && remove.length) {
          for (const name of remove) {
            const game: IGame | null = await Game.findOne({ name });
            if (!game) throw new NotFound(`Game with name ${name} not found`);

            (removeGamesPlayed as ObjectId[]).push(game._id);
            if ((game.teams as ObjectId[]).includes(existingTeam._id)) await Game.findByIdAndUpdate(game._id, { $pull: { teams: existingTeam._id } });
          }

          const removeGamesPS = removeGamesPlayed.map((game) => game.toString());
          currentGamesP.splice(0, currentGamesP.length, ...currentGamesP.filter((game) => !removeGamesPS.includes(game.toString())));
        }
      }

      const addGamesPlayed: ObjectId[] = [];
      if (add) {
        if (!Array.isArray(add) || !add.length) throw new BadRequest('Invalid add value');

        for (const name of add) {
          const game: IGame | null = await Game.findOne({ name });
          if (!game) throw new NotFound(`Game with name ${name} not found`);
          if ((game.teams as ObjectId[]).includes(existingTeam._id)) throw new Conflict('Game already added');

          (addGamesPlayed as ObjectId[]).push(game._id);
          await Game.findByIdAndUpdate(game._id, { $addToSet: { teams: existingTeam._id } });
        }
      }

      add ? (updatedFields.games_played = [...currentGamesP, ...addGamesPlayed]) : (updatedFields.games_played = currentGamesP);
    }

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
