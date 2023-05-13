import { NextFunction, Request, Response } from 'express';

import RoleGame from '../models/roleGame.model';

import { IRoleGame } from '../interfaces/models.interfaces';
import { BadRequest, Conflict, NotFound } from '../helpers/custom.errors';

export const getRoleGame = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name } = request.query;

    let query: any = name && { name: { $regex: name.toString(), $options: 'i' } };

    const roleGame: IRoleGame[] = await RoleGame.find(query);

    if (!roleGame.length) throw new NotFound(name ? `RoleGame with name ${name} not found` : 'RoleGames not found');

    response.status(200).json(roleGame);
  } catch (error) {
    next(error);
  }
};

export const createRole = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name, description } = request.body;

    if (!name || !description) throw new BadRequest('Name and description are required');

    const existingRoleGame: IRoleGame | null = await RoleGame.findOne({ name });
    if (existingRoleGame) throw new Conflict(`RoleGame with name ${name} already exists`);

    const roleGame: IRoleGame = new RoleGame({ name, description });
    await roleGame.save();

    response.status(201).json(roleGame);
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const roleId = request.params.id;

    if (!roleId) throw new BadRequest('Role ID is required');

    const role: IRoleGame | null = await RoleGame.findById(roleId);

    if (!role || role.isDeleted) throw new NotFound('Not found');

    if (request.body.name) {
      const existingRole = await RoleGame.findOne({ name: request.body.name });
      if (existingRole && existingRole._id.toString() !== roleId) throw new Conflict('Name already in use');

      role.name = request.body.name;
    }

    if (request.body.description) role.description = request.body.description;

    await role.save();

    return response.status(200).json({ message: 'Updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteRole = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params;
    if (!id) throw new BadRequest('Id is required');

    const existingRoleGame: IRoleGame | null = await RoleGame.findById(id);
    if (!existingRoleGame) throw new NotFound(`RoleGame with id ${id} not found`);

    if (existingRoleGame.isDeleted) throw new Conflict(`RoleGame it is already eliminated`);

    existingRoleGame.isDeleted = true;

    await existingRoleGame.save();

    response.status(200).json({ message: `RoleGame with id ${id} deleted` });
  } catch (error) {
    next(error);
  }
};
