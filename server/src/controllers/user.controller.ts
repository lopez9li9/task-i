import { NextFunction, Request, Response } from 'express';

import Role from '../models/role.model';
import Team from '../models/team.model';
import User from '../models/user.model';
import RoleGame from '../models/roleGame.model';

import { IRole, IRoleGame, ITeam, IUser } from '../interfaces/models.interfaces';
import { BadRequest, Conflict, NotFound } from '../helpers/custom.errors';

const formatUserData = (users: IUser[]): Partial<IUser>[] =>
  users.map(
    (user: IUser) =>
      new Object({
        _id: user._id,
        username: user.username,
        email: user.email,
        password: user.password,
        role: user.role.name,
        roleGame: user.roleGame ? user.roleGame.name : null,
        team: user.team ? user.team.name : null,
      })
  );

export const getUser = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name } = request.query;
    const query: any = name && { username: { $regex: name.toString(), $options: 'i' } };

    const users: IUser[] = await User.find(query).populate('role').populate('team').populate('roleGame');
    if (!users.length) throw new NotFound(name ? `User with name ${name} not found` : 'Users not found');

    response.status(200).json(formatUserData(users));
  } catch (error) {
    next(error);
  }
};

export const createUser = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { username, email, password, role, roleGame, team } = request.body;
    if (!username || !email || !password || !role) throw new BadRequest('Username, email, password, and role are required');

    const existingUsername: IUser | null = await User.findOne({ username });
    if (existingUsername) throw new Conflict('Username already exists');

    const existingEmail: IUser | null = await User.findOne({ email });
    if (existingEmail) throw new Conflict('Email already exists');

    const roleExists: IRole | null = await Role.findOne({ name: role });
    if (!roleExists) throw new NotFound('Role does not exist');

    let roleGameId = null;
    if (roleGame) {
      const roleGameExists: IRoleGame | null = await RoleGame.findOne({ name: roleGame });
      if (!roleGameExists) throw new NotFound('RoleGame does not exist');
      roleGameId = roleGameExists._id;
    }

    let teamId = null;
    if (team) {
      const existingTeam: ITeam | null = await Team.findOne({ name: team });
      if (!existingTeam) throw new NotFound('Team does not exist');
      teamId = existingTeam._id;
    }

    const newUser: IUser = new User({ username, email, password, role: roleExists._id, team: teamId, roleGame: roleGameId });
    await newUser.save();

    response.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params;

    if (!id) throw new BadRequest('Id is required');

    const existingUser: IUser | null = await User.findById(id).populate('role', 'name').populate('roleGame', 'name').populate('team', 'name');
    console.log(existingUser);
    if (!existingUser) throw new NotFound(`User with id ${id} not found`);

    const updatedFields: Partial<IUser> = {};

    const username: string | undefined = request.body.username;
    if (username) {
      if (await User.findOne({ username, _id: { $ne: id } })) throw new Conflict('Username name already exists');
      if (username === existingUser.username) throw new Conflict('Username cannot be the same');
      updatedFields.username = username;
    }

    const password: string | undefined = request.body.password;
    if (password) {
      if (password === existingUser.password) throw new Conflict('Password cannot be the same');
      updatedFields.password = password;
    }

    const role: string | undefined = request.body.role;
    if (role) {
      const roleExists: IRole | null = await Role.findOne({ name: role });
      if (!roleExists) throw new NotFound('Role does not exist');
      if (role === existingUser.role.name) throw new Conflict('Role cannot be the same');
      updatedFields.role = roleExists._id;
    }

    const roleGame: string | undefined = request.body.roleGame;
    if (roleGame) {
      const roleGameExists: IRoleGame | null = await RoleGame.findOne({ name: roleGame });
      if (!roleGameExists) throw new NotFound('RoleGame does not exist');
      if (roleGame === existingUser.roleGame.name) throw new Conflict('RoleGame cannot be the same');
      updatedFields.roleGame = roleGameExists._id;
    }

    const team: string | undefined = request.body.team;
    if (team) {
      if (team === 'none') {
        if (!existingUser.team) throw new Conflict('User is not associated with any team');

        await Team.findByIdAndUpdate(existingUser.team, { $pull: { members: existingUser._id } });
        updatedFields.team = null;
      } else {
        const existingTeam: ITeam | null = await Team.findOne({ name: team });
        if (!existingTeam) throw new NotFound('Team does not exist');
        if (team === existingUser.team?.name) throw new Conflict('Team cannot be the same');
        if (existingUser.team) await Team.findByIdAndUpdate(existingUser.team, { $pull: { members: existingUser._id } });

        await Team.findByIdAndUpdate(existingTeam._id, { $addToSet: { members: existingUser._id } });
        updatedFields.team = existingTeam._id;
      }
    }

    if (!Object.keys(updatedFields).length) throw new Conflict('No changes to update');

    const updateUser = await User.findByIdAndUpdate(id, updatedFields, { new: true });

    response.status(200).json(updateUser);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const deleteUser = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params;
    if (!id) throw new BadRequest('Id is required');
    if (!(await User.findById(id))) throw new NotFound(`User ${id} not found`);

    await User.findByIdAndDelete(id);

    response.status(200).json({ message: 'User Deleted successfully' });
  } catch (error) {
    next(error);
  }
};
