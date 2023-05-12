import { Request, Response, NextFunction } from 'express';

import Role from '../models/role.model';

import { arraysEqual } from '../utils';
import { BadRequest, Conflict, NotFound } from '../helpers/custom.errors';
import { IRole } from '../interfaces/models.interfaces';

/** GET */
export const getRoles = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name } = request.query;
    let query: any = {};

    if (name) {
      query = { name: { $regex: name.toString(), $options: 'i' } };
    }

    query.status = { $ne: false };

    const roles: IRole[] = await Role.find(query);

    if (!roles.length) {
      throw new NotFound(name ? `Role with name ${name} not found` : 'Roles not found');
    }

    response.status(200).json(roles);
  } catch (error) {
    next(error);
  }
};

/** POST */
export const createRole = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name, permissions } = request.body;
    if (!name || !permissions) {
      throw new BadRequest('Name and permissions are required');
    }

    // Validate the permits entered
    const allowedPermissions = ['read', 'write', 'delete']; // Allowed permits
    const invalidPermissions = permissions.filter((permission: string) => !allowedPermissions.includes(permission));

    if (invalidPermissions.length > 0) {
      throw new BadRequest('Invalid permissions');
    }

    const existingRole: IRole | null = await Role.findOne({ name });
    if (existingRole) {
      throw new Conflict(`Role with name ${name} already exists`);
    }

    const role: IRole = new Role({ name, permissions });
    await role.save();
    response.status(201).json(role);
  } catch (error) {
    next(error);
  }
};

/** PUT */
export const updateRole = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params;
    const { name, permissions } = request.body;

    if (!id) {
      throw new BadRequest('Id is required');
    }

    const existingRole: IRole | null = await Role.findById(id);

    if (!existingRole) {
      throw new BadRequest('Role not found');
    }

    const updatedFields: Partial<IRole> = {};

    if (name && name !== existingRole.name) {
      updatedFields.name = name;
    }

    if (permissions) {
      if (!Array.isArray(permissions) || !permissions.every((perm: string) => ['read', 'write', 'delete'].includes(perm))) {
        throw new BadRequest('Invalid permissions. Only "read", "write", or "delete" are allowed.');
      }

      if (!arraysEqual(permissions, existingRole.permissions)) {
        updatedFields.permissions = permissions;
      }
    }

    if (Object.keys(updatedFields).length === 0) {
      // No changes were made in the fields provided
      throw new BadRequest('No changes to update');
    }

    const updatedRole: IRole | null = await Role.findByIdAndUpdate(id, updatedFields, { new: true });

    response.status(200).json(updatedRole);
  } catch (error) {
    next(error);
  }
};

/** DELETE */
export const deleteRole = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params;

    if (!id) {
      throw new BadRequest('Id is required');
    }

    const role: IRole | null = await Role.findById(id);

    if (!role) {
      throw new NotFound('Role not found');
    }

    if (!role.status) {
      throw new BadRequest('Role has already been deleted');
    }

    role.status = false;
    await role.save();

    response.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    next(error);
  }
};
