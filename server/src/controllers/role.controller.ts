import { Request, Response, NextFunction } from 'express';

import Role from '../models/role.model';

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
    next(error);
  }
};

export const createRole = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name, permissions } = request.body;

    if (!name || !permissions) throw new BadRequest('Name and permissions are required');
    if (!Array.isArray(permissions)) throw new BadRequest('Permissions must be an array');

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

    const currentRole: IRole | null = await Role.findById(id);
    if (!currentRole) throw new NotFound('Role not found');

    const updatedFields: Partial<IRole> = {};

    const name: string | undefined = request.body.name;
    if (name) {
      if (await Role.findOne({ name, _id: { $ne: id } })) throw new Conflict('Role name already exists');
      if (name === currentRole.name) throw new Conflict('Changes were not applied');
      updatedFields.name = name;
    }

    const permissions: { add?: string[]; remove?: string[] | string; del: boolean } | undefined = request.body.permissions;
    if (permissions) {
      const currentPermissions: string[] = currentRole.permissions;
      const { add }: { add?: string[] } | undefined = permissions;
      if (add) {
        if (typeof add === 'string' && (currentPermissions.includes(add) || !allPerm.includes(add)))
          throw new BadRequest(currentPermissions.includes(add) ? 'Permission already exists' : 'Permission not available');
        if (
          Array.isArray(add) &&
          (add.every((permission: string) => currentPermissions.includes(permission)) ||
            !add.every((permission: string) => allPerm.includes(permission)))
        )
          throw new BadRequest('Invalid permissions');
        updatedFields.permissions = Array.isArray(add) ? [...currentPermissions, ...add] : [...currentPermissions, add];
      }
      const { remove }: { remove?: string | string[] } | undefined = permissions;
      if (remove) {
        if (typeof remove === 'string') {
          if (!currentPermissions.includes(remove)) throw new BadRequest(`Permission "${remove}" not found in current permissions`);
          updatedFields.permissions = currentPermissions.filter((permission: string) => permission !== remove);
        }
        if (Array.isArray(remove)) {
          if (!remove.every((permission: string) => currentPermissions.includes(permission))) throw new BadRequest('Invalid permissions');
          updatedFields.permissions = currentPermissions.filter((permission: string) => !remove.includes(permission));
        }
      }
      const del: boolean | undefined = permissions.del;
      if (del) {
        if (typeof del !== 'boolean') throw new Conflict('Invalid permissions');
        if (!updatedFields.permissions?.length) throw new BadRequest('Empty permissions');
        updatedFields.permissions = [];
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
    const id: string | undefined = request.params.id;
    if (!(await Role.findById(id))) throw new Error(`User role ${id} not found`);

    await Role.findByIdAndDelete(id);

    response.status(200).json({ message: 'User role deleted successfully' });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
