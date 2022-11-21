import axios from 'axios';
import { AuthParams, ClientOptions } from './common';
import { omitKeys } from './utils';

type SearchGroupsParams = AuthParams & {
  name?: string;
  organizationId: string;
  memberType?: 'USER' | 'DEVICE' | 'SERVICE';
  memberId?: string;
};

export type Group = {
  id: string;
  name: string;
  description?: string;
  managingOrganization: string;
};

type ETag = {
  eTag?: string;
};

type IdmGroup = {
  resource: {
    resourceType: string;
    groupName: string;
    groupDescription?: string;
    orgId: string;
    _id: string;
  };
};

type GroupListResponse = {
  total: number;
  entry: IdmGroup[];
};

type CreateGroupParams = AuthParams & {
  name: string;
  managingOrganization: string;
  description?: string;
};

type GroupByIdParams = AuthParams & {
  id: string;
};

type AddRemoveMembersParams = AuthParams & {
  groupId: string;
  userIds: string[];
};

type AssignRemoveIdentitiesParams = AuthParams &
  ETag & {
    groupId: string;
    memberType: 'DEVICE' | 'SERVICE';
    ids: string[];
  };

export type AddRemoveRolesParams = AuthParams & {
  groupId: string;
  roleIds: string[];
};

export function createGroupsClient(options: ClientOptions) {
  const axiosInstance = axios.create({ baseURL: options.idmUrl + '/authorize/identity/Group' });

  const client = {
    async searchGroups(params: SearchGroupsParams): Promise<Group[]> {
      const response = await axiosInstance.get<GroupListResponse>('/', {
        params: omitKeys(params, ['accessToken']),
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'API-Version': 1,
        },
      });

      return response.data.entry.map((g) => ({
        id: g.resource._id,
        name: g.resource.groupName,
        description: g.resource.groupDescription,
        managingOrganization: g.resource.orgId,
      }));
    },

    async createGroup(params: CreateGroupParams): Promise<Group & ETag> {
      const response = await axiosInstance.post<Group>('/', omitKeys(params, ['accessToken']), {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'API-Version': 1,
        },
      });
      return { ...response.data, eTag: response.headers.etag };
    },

    async deleteGroup(params: GroupByIdParams) {
      await axiosInstance.delete(`/${params.id}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'API-Version': 1,
        },
      });
    },

    async getGroupById(params: GroupByIdParams): Promise<Group & ETag> {
      const response = await axiosInstance.get<Group>(`/${params.id}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'API-Version': 1,
        },
      });
      return { ...response.data, eTag: response.headers.etag };
    },

    async addMembersToGroup(params: AddRemoveMembersParams): Promise<ETag> {
      const response = await axiosInstance.post(
        `/${params.groupId}/$add-members`,
        {
          resourceType: 'Parameters',
          parameter: [
            {
              name: 'UserIDCollection',
              references: params.userIds.map((u) => ({ reference: u })),
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${params.accessToken}`,
            'API-Version': 1,
          },
        },
      );
      return { eTag: response.headers.etag };
    },

    async removeMembersFromGroup(params: AddRemoveMembersParams): Promise<ETag> {
      const response = await axiosInstance.post(
        `/${params.groupId}/$remove-members`,
        {
          resourceType: 'Parameters',
          parameter: [
            {
              name: 'UserIDCollection',
              references: params.userIds.map((u) => ({ reference: u })),
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${params.accessToken}`,
            'API-Version': 1,
          },
        },
      );
      return { eTag: response.headers.etag };
    },

    async assignRolesToGroup(params: AddRemoveRolesParams): Promise<ETag> {
      const response = await axiosInstance.post(
        `/${params.groupId}/$assign-role`,
        {
          roles: params.roleIds,
        },
        {
          headers: {
            Authorization: `Bearer ${params.accessToken}`,
            'API-Version': 1,
          },
        },
      );
      return { eTag: response.headers.etag };
    },

    async removeRolesFromGroup(params: AddRemoveRolesParams): Promise<ETag> {
      const response = await axiosInstance.post(
        `/${params.groupId}/$remove-role`,
        {
          roles: params.roleIds,
        },
        {
          headers: {
            Authorization: `Bearer ${params.accessToken}`,
            'API-Version': 1,
          },
        },
      );
      return { eTag: response.headers.etag };
    },

    async assignIdentitiesToGroup(params: AssignRemoveIdentitiesParams): Promise<ETag> {
      const ETag =
        params.eTag ||
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (await this.getGroupById({ accessToken: params.accessToken, id: params.groupId })).eTag!;

      const response = await axiosInstance.post(
        `/${params.groupId}/$assign`,
        {
          memberType: params.memberType,
          value: params.ids,
        },
        {
          headers: {
            Authorization: `Bearer ${params.accessToken}`,
            'API-Version': 1,
            'If-Match': ETag,
          },
        },
      );
      return { eTag: response.headers.etag };
    },

    async removeIdentitiesFromGroup(params: AssignRemoveIdentitiesParams): Promise<ETag> {
      const ETag =
        params.eTag ||
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (await this.getGroupById({ accessToken: params.accessToken, id: params.groupId })).eTag!;

      const response = await axiosInstance.post(
        `/${params.groupId}/$remove`,
        {
          memberType: params.memberType,
          value: params.ids,
        },
        {
          headers: {
            Authorization: `Bearer ${params.accessToken}`,
            'API-Version': 1,
            'If-Match': ETag,
          },
        },
      );
      return { eTag: response.headers.etag };
    },
  };
  return client;
}
