import { Request, Response, NextFunction } from 'express';

import Role from '../models/role.model';

import { arraysEqual } from '../utils';
import { BadRequest, Conflict, NotFound } from '../helpers/custom.errors';
import { IRole } from '../interfaces/models.interfaces';

export const getRoles = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name } = request.query;

    let query: any = name && { name: { $regex: name.toString(), $options: 'i' } };

    const roles: IRole[] = await Role.find(query);
    if (!roles.length) throw new NotFound(name ? `Role with name ${name} not found` : 'Roles not found');

    response.status(200).json(roles);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const createRole = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name, permissions } = request.body;

    if (!name || !permissions) throw new BadRequest('Name and permissions are required');

    // Validate the permits entered
    const allowedPermissions = ['read', 'write', 'delete'];
    const invalidPermissions = permissions.filter((permission: string) => !allowedPermissions.includes(permission));

    if (invalidPermissions.length > 0) throw new BadRequest('Invalid permissions');

    const existingRole: IRole | null = await Role.findOne({ name });
    if (existingRole) throw new Conflict(`Role with name ${name} already exists`);

    const role: IRole = new Role({ name, permissions });
    await role.save();

    response.status(201).json(role);
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params;

    if (!id) throw new BadRequest('Id is required');

    const existingRole: IRole | null = await Role.findById(id);

    if (!existingRole?.isDeleted) throw new NotFound("Don't permissions to update this role");

    if (!existingRole) throw new NotFound('Role not found');

    const { name, permissions } = request.body;

    if (await Role.findOne({ name, _id: { $ne: id } })) throw new Conflict('Role name already exists');

    const updatedFields: Partial<IRole> = {};

    if (name === existingRole.name) throw new Conflict('Role name already exists');
    if (name && name !== existingRole.name) updatedFields.name = name;

    if ((permissions && !Array.isArray(permissions)) || !permissions.every((perm: string) => ['read', 'write', 'delete'].includes(perm)))
      throw new BadRequest('Invalid permissions');
    if (permissions && !arraysEqual(permissions, existingRole.permissions)) updatedFields.permissions = permissions;

    // No changes were made in the fields provided
    if (!Object.keys(updatedFields).length) throw new Conflict('No changes to update');

    const updatedRole: IRole | null = await Role.findByIdAndUpdate(id, updatedFields, { new: true });

    response.status(200).json(updatedRole);
  } catch (error) {
    next(error);
  }
};

export const deleteRole = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params;

    if (!id) {
      throw new BadRequest('Id is required');
    }

    const role: IRole | null = await Role.findById(id);

    if (!role) throw new NotFound('Role not found');

    if (!role.isDeleted) throw new BadRequest('Role has already been deleted');

    role.isDeleted = false;
    await role.save();

    response.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    next(error);
  }
};
