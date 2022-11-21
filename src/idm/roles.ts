import axios from 'axios';
import { AuthParams, ClientOptions } from './common';
import { IamPermission } from './iam-permissions';
import { omitKeys } from './utils';

type SearchRolesParams = AuthParams & {
  name?: string;
  groupId?: string;
  organizationId?: string;
};

export type Role = {
  id: string;
  name: string;
  description?: string;
  managingOrganization: string;
};

type RoleListResponse = {
  total: number;
  entry: Role[];
};

type CreateRoleParams = AuthParams & {
  name: string;
  managingOrganization: string;
  description?: string;
};

type RoleByIdParams = AuthParams & {
  id: string;
};

export type IamPermissionInput = IamPermission | string;

type AssignRemovePermissionsParams = AuthParams & {
  roleId: string;
  permissions: IamPermissionInput[];
};

export function createRolesClient(options: ClientOptions) {
  const axiosInstance = axios.create({ baseURL: options.idmUrl + '/authorize/identity/Role' });
  return {
    async searchRoles(params: SearchRolesParams): Promise<Role[]> {
      const response = await axiosInstance.get<RoleListResponse>('/', {
        params: omitKeys(params, ['accessToken']),
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'API-Version': 1,
        },
      });
      return response.data.entry;
    },
    async createRole(params: CreateRoleParams): Promise<Role> {
      const response = await axiosInstance.post<Role>('/', omitKeys(params, ['accessToken']), {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'API-Version': 1,
        },
      });
      return response.data;
    },
    async deleteRole(params: RoleByIdParams) {
      await axiosInstance.delete(`/${params.id}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'API-Version': 1,
        },
      });
    },
    async getRoleById(params: RoleByIdParams): Promise<Role> {
      const response = await axiosInstance.get<Role>(`/${params.id}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'API-Version': 1,
        },
      });
      return response.data;
    },
    async assignPermissionsToRole(params: AssignRemovePermissionsParams) {
      await axiosInstance.post(
        `/${params.roleId}/$assign-permission`,
        {
          permissions: params.permissions,
        },
        {
          headers: {
            Authorization: `Bearer ${params.accessToken}`,
            'API-Version': 1,
          },
        },
      );
    },

    async removePermissionsFromRole(params: AssignRemovePermissionsParams) {
      await axiosInstance.post(
        `/${params.roleId}/$remove-permission`,
        {
          permissions: params.permissions,
        },
        {
          headers: {
            Authorization: `Bearer ${params.accessToken}`,
            'API-Version': 1,
          },
        },
      );
    },
  };
}
