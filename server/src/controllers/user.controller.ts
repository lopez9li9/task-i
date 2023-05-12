import { NextFunction, Request, Response } from 'express';
import { IRole, IUser } from '../interfaces/models.interfaces';
import User from '../models/user.model';
import { BadRequest, Conflict, NotFound } from '../helpers/custom.errors';
import Role from '../models/role.model';

export const getUser = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name } = request.query;

    let query: any = {};

    if (name) {
      query = { username: { $regex: name, $options: 'i' } };
    }

    query.status = { $ne: false };

    const users: IUser[] = await User.find(query).populate('role', 'name');

    if (!users.length) {
      throw new NotFound(name ? `User with name ${name} not found` : 'Users not found');
    }

    response.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { username, email, password, role } = request.body;

    if (!username || !email || !password || !role) {
      throw new BadRequest('Username, email, password and role are required');
    }

    const roleExists: IRole | null = await Role.findOne({ name: role, status: true });
    console.log(roleExists);

    if (!roleExists) {
      throw new BadRequest('Role does not exist');
    }

    const userExists: IUser | null = await User.findOne({ email, status: true });
    console.log(userExists);

    if (userExists) {
      throw new Conflict(`User with email ${email} already exists`);
    }

    const user: IUser = new User({ username, email, password, role: roleExists._id });
    await user.save();

    response.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params;

    if (!id) {
      throw new BadRequest('Id is required');
    }

    const user: IUser | null = await User.findOne({ _id: id, status: true });

    if (!user) {
      throw new NotFound(`User with id ${id} not found`);
    }

    const { username, password, role } = request.body;

    if (!username || !password || !role) {
      throw new BadRequest('At least one field is required');
    }

    const existingUsername: IUser | null = await User.findOne({ username, status: true });

    if (existingUsername && existingUsername._id.toString() !== id) {
      throw new BadRequest(`User with username ${username} already exists`);
    }

    if (username === user.username) {
      throw new Conflict('Username cannot be the same');
    }

    username && (user.username = username);

    if (password === user.password) {
      throw new Conflict('Password cannot be the same');
    }
    password && (user.password = password);

    if (role === user.role) {
      throw new Conflict('Role cannot be the same');
    }

    role && (user.role = role);

    await user.save();
    response.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params;

    if (!id) {
      throw new BadRequest('Id is required');
    }

    const user: IUser | null = await User.findOne({ _id: id, status: true });
    if (!user) {
      throw new NotFound(`User with id ${id} not found`);
    }

    if (!user.status) {
      throw new BadRequest(`User has already been deleted`);
    }

    user.status = false;
    await user.save();

    response.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};
