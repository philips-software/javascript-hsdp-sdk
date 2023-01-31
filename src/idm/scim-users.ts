import axios from 'axios';
import { z } from 'zod';
import { AuthParams, ClientOptions } from './common';
import { UserFilter } from './filters';
import { scimListResponse, scimReference, scimResource } from './scim';

export type SearchUsersParams = AuthParams & {
  attributes?: string;
  excludedAttributes?: string;
  filter?: UserFilter;
  startIndex?: number;
  count?: number;
};

const USER_EXT_URN = 'urn:ietf:params:scim:schemas:extension:philips:hsdp:2.0:User';
const USER_ACCOUNT_STATUS_URN =
  'urn:ietf:params:scim:schemas:extension:philips:hsdp:2.0:UserAccountStatus';

export const scimUser = scimResource.merge(
  z.object({
    userName: z.string(),
    name: z.object({
      fullName: z.string(),
      familyName: z.string(),
      givenName: z.string(),
      middleName: z.string().optional(),
      honorificPrefix: z.string().optional(),
      honorificSuffix: z.string().optional(),
    }),
    preferredLanguage: z.string().optional(),
    locale: z.string().optional(),
    active: z.boolean(),
    emails: z.array(
      z.object({
        type: z.enum(['work', 'home', 'other']).optional(),
        primary: z.boolean().optional(),
        value: z.string(),
      }),
    ),
    phoneNumbers: z
      .array(
        z.object({
          type: z.enum(['work', 'home', 'mobile', 'fax', 'other']).optional(),
          primary: z.boolean().optional(),
          value: z.string(),
        }),
      )
      .optional(),
    [USER_EXT_URN]: z
      .object({
        organization: scimReference.optional(),
        emailVerified: z.boolean().optional(),
        phoneVerified: z.boolean().optional(),
      })
      .optional(),
    [USER_ACCOUNT_STATUS_URN]: z
      .object({
        disabled: z.boolean().optional(),
      })
      .optional(),
  }),
);

export type ScimUser = z.infer<typeof scimUser>;

const scimUsersResponse = scimListResponse(scimUser);
type ScimUsersResponse = z.infer<typeof scimUsersResponse>;

export function createScimUsersClient(options: ClientOptions) {
  const axiosInstance = axios.create({ baseURL: options.idmUrl + '/authorize/scim/v2/Users' });
  const client = {
    async searchUsers(params: SearchUsersParams): Promise<ScimUsersResponse> {
      const response = await axiosInstance.get<ScimUsersResponse>(`/`, {
        params,
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'API-Version': 1,
        },
      });

      return scimUsersResponse.parse(response.data);
    },
  };
  return client;
}
