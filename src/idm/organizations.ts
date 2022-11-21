import axios from 'axios';
import { z } from 'zod';
import { AuthParams, ClientOptions } from './common';
import { OrganizationFilter } from './organization-filters';
import { scimListResponse, scimReference, scimResource } from './scim';
import { omitKeys } from './utils';

type SearchOrganizationsParams = AuthParams & {
  filter?: OrganizationFilter;
  startIndex?: number;
  count?: number;
};

const scimOrganization = scimResource.merge(
  z.object({
    name: z.string(),
    description: z.string().optional(),
    parent: scimReference,
    active: z.boolean(),
    inheritProperties: z.boolean(),
    owners: z.array(scimReference),
    createdBy: scimReference,
    modifiedBy: scimReference,
    displayName: z.string().optional(),
  }),
);

export const scimOrganizationsListResponse = scimListResponse(scimOrganization);

const convertScimOrganizationToOrganization = ({
  id,
  name,
  description,
  active,
  inheritProperties,
  displayName,
}: ScimOrganization): Organization => ({
  id,
  name,
  description: description || '',
  active,
  inheritProperties,
  displayName,
});

const convertListResponseToOrganizations = (
  listResponse: z.infer<typeof scimOrganizationsListResponse>,
): Organization[] => listResponse.Resources.map(convertScimOrganizationToOrganization);

type ScimOrganization = z.infer<typeof scimOrganization>;

export type Organization = {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  inheritProperties: boolean;
  displayName?: string;
};

type CreateOrganizationParams = AuthParams & {
  name: string;
  parentId: string;
  description?: string;
  displayName?: string;
  externalId?: string;
  type?: string;
  address?: {
    formatted?: string;
    streetAddress?: string;
    locality?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
};

type OrganizationByIdParams = AuthParams & {
  id: string;
};

export function createOrganizationsClient(options: ClientOptions) {
  const axiosInstance = axios.create({
    baseURL: options.idmUrl + '/authorize/scim/v2/Organizations',
  });

  return {
    async searchOrganizations(params: SearchOrganizationsParams): Promise<Organization[]> {
      const searchParams = {
        filter: params.filter || undefined,
        startIndex: params.startIndex || undefined,
        count: params.count || undefined,
      };

      const response = await axiosInstance.get('/', {
        params: searchParams,
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'API-Version': 2,
        },
      });
      const listResponse = scimOrganizationsListResponse.parse(response.data);
      return convertListResponseToOrganizations(listResponse);
    },

    async createOrganization(params: CreateOrganizationParams): Promise<Organization> {
      const createParams = omitKeys(params, ['parentId', 'accessToken']);
      const response = await axiosInstance.post(
        '/',
        {
          schemas: ['urn:ietf:params:scim:schemas:core:philips:hsdp:2.0:Organization'],
          ...createParams,
          parent: {
            value: params.parentId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${params.accessToken}`,
            'API-Version': 2,
          },
        },
      );
      const organization = scimOrganization.parse(response.data);
      return convertScimOrganizationToOrganization(organization);
    },

    async getOrganizationById(params: OrganizationByIdParams): Promise<Organization> {
      const response = await axiosInstance.get(`/${params.id}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'API-Version': 2,
        },
      });
      const organization = scimOrganization.parse(response.data);
      return convertScimOrganizationToOrganization(organization);
    },

    async updateOrganization(
      params: CreateOrganizationParams & OrganizationByIdParams,
    ): Promise<Organization> {
      const createParams = omitKeys(params, ['id', 'parentId', 'accessToken']);
      const existingOrganization = await axiosInstance.get(`/${params.id}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'API-Version': 2,
        },
      });
      const response = await axiosInstance.put(
        `/${params.id}`,
        {
          schemas: ['urn:ietf:params:scim:schemas:core:philips:hsdp:2.0:Organization'],
          ...createParams,
          parent: {
            value: params.parentId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${params.accessToken}`,
            'API-Version': 2,
            'If-Match': existingOrganization.headers['etag'],
          },
        },
      );
      const organization = scimOrganization.parse(response.data);
      return convertScimOrganizationToOrganization(organization);
    },

    async deleteOrganizationById(params: OrganizationByIdParams): Promise<void> {
      await axiosInstance.delete(`/${params.id}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'API-Version': 2,
          'If-Method': 'DELETE',
        },
      });
    },
  };
}
