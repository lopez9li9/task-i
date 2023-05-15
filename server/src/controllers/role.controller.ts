import { Request, Response, NextFunction } from 'express';

import Role from '../models/role.model';

import { arraysContains, arraysEqual, arraysIntersect } from '../utils';
import { BadRequest, Conflict, NotFound } from '../helpers/custom.errors';
import { IRole } from '../interfaces/models.interfaces';

const allPerm = ['read', 'write', 'delete'];

export const getRoles = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name } = request.query;

    const query: any = name && { name: { $regex: name.toString(), $options: 'i' } };

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

    const invalidPermissions = permissions.filter((permission: string) => !allPerm.includes(permission));

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
    if (!existingRole) throw new NotFound('Role not found');

    const updatedFields: Partial<IRole> = {};

    const name: string | undefined = request.body.name;
    if (name) {
      if (await Role.findOne({ name, _id: { $ne: id } })) throw new Conflict('Role name already exists');
      if (name === existingRole.name) throw new Conflict('Changes were not applied');
      updatedFields.name = name;
    }

    const permissions: { add?: string[]; remove?: string[] | string } | undefined = request.body.permissions;
    if (permissions) {
      const { add, remove } = permissions;
      if (add && remove && typeof remove !== 'string' && arraysEqual(add, remove)) throw new Conflict('Changes were not applied');

      if (remove) {
        if (remove === 'all') {
          if (!existingRole.permissions.length) throw new Conflict('Role has no permissions to remove');
          updatedFields.permissions = [];
        } else {
          if (!Array.isArray(remove)) throw new BadRequest('Invalid remove format');
          for (const permission of remove) if (!allPerm.includes(permission)) throw new Conflict(`Invalid permission to remove: ${permission}`);
          if (!arraysContains(existingRole.permissions, remove)) throw new Conflict('Permissions to remove not found in role');

          updatedFields.permissions = existingRole.permissions.filter((permission) => !remove.includes(permission));
        }
      }

      if (add) {
        if (!Array.isArray(add)) throw new BadRequest('Invalid add format');
        if (arraysIntersect(existingRole.permissions, add)) throw new Conflict('Permissions to add already exist in role');

        for (const permission of add) {
          if (!allPerm.includes(permission)) throw new Conflict(`Invalid permission to add: ${permission}`);
          updatedFields.permissions ? updatedFields.permissions.push(permission) : (updatedFields.permissions = [permission]);
        }
      }
    }

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

    response.status(204).json({ message: 'Role deleted successfully' });
  } catch (error) {
    next(error);
  }
};
