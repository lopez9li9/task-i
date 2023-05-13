import { NextFunction, Request, Response } from 'express';

import Role from '../models/role.model';
import Team from '../models/team.model';
import User from '../models/user.model';

import { IRole, ITeam, IUser } from '../interfaces/models.interfaces';
import { BadRequest, Conflict, NotFound } from '../helpers/custom.errors';
/*import Team from '../models/team.model';*/

export const getUser = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name } = request.query;

    let query: any = {};

    if (name) query = { username: { $regex: name, $options: 'i' } };

    query.status = { $ne: false };

    const users: IUser[] = await User.find(query).populate('role', 'name');

    if (!users.length) throw new NotFound(name ? `User with name ${name} not found` : 'Users not found');

    const usersFormatted = users.map(({ _id, username, email, role, team }: IUser) => {
      return { _id, username, email, role: role.name, team: team?.name };
    });

    response.status(200).json(usersFormatted);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { username, email, password, role, team } = request.body;

    if (!username || !email || !password || !role) throw new BadRequest('Username, email, password, and role are required');

    const existingUsername: IUser | null = await User.findOne({ username });
    if (existingUsername) throw new Conflict('Username already exists');

    const existingEmail: IUser | null = await User.findOne({ email });
    if (existingEmail) throw new Conflict('Email already exists');

    const roleExists: IRole | null = await Role.findOne({ name: role });
    if (!roleExists) throw new NotFound('Role does not exist');

    let teamId = null;
    if (team) {
      const existingTeam: ITeam | null = await Team.findOne({ name: team });
      if (!existingTeam) throw new NotFound('Team does not exist');

      teamId = existingTeam._id;
    }

    const newUser: IUser = new User({ username, email, password, role: roleExists._id, team: teamId });

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

    const user: IUser | null = await User.findById(id).populate('role', 'name');
    console.log(user);

    if (!user) throw new NotFound(`User with id ${id} not found`);

    const { username, password, role /*, team*/ } = request.body;
    console.log(password);

    if (!username && !password && !role /* && !team*/) throw new BadRequest('At least one field is required');

    if (username) {
      const existingUser: IUser | null = await User.findOne({ username });

      if (existingUser && existingUser._id.toString() !== id) throw new BadRequest(`${username} not available`);
      if (username === user.username) throw new Conflict('Username cannot be the same');

      user.username = username;
    }

    if (password) {
      if (password === user.password) throw new Conflict('Password cannot be the same');

      user.password = password;
    }

    if (role) {
      const roleExists: IRole | null = await Role.findOne({ name: role });

      if (!roleExists) throw new NotFound('Role does not exist');
      if (role === user.role.name) throw new Conflict('Role cannot be the same');

      user.role = roleExists._id;
    }

    /** FOR TEAM */

    await user.save();

    response.status(200).json({ message: 'Updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params;

    if (!id) throw new BadRequest('Id is required');

    const user: IUser | null = await User.findById(id);
    if (!user) throw new NotFound(`User with id ${id} not found`);

    if (!user.status) throw new BadRequest(`User has already been deleted`);

    user.status = false;
    await user.save();

    response.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};