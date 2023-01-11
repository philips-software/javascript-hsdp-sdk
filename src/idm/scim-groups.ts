import axios from 'axios';
import { AuthParams, ClientOptions } from './common';
import { z } from 'zod';
import { scimResource, scimReference, scimListResponse } from './scim';

const USER_SCHEMA = 'urn:ietf:params:scim:schemas:core:2.0:User';
const DEVICE_SCHEMA = 'urn:ietf:params:scim:schemas:core:philips:hsdp:2.0:Device';
const SERVICE_SCHEMA = 'urn:ietf:params:scim:schemas:core:philips:hsdp:2.0:Service';

const scimUser = scimResource.merge(
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
    'urn:ietf:params:scim:schemas:extension:philips:hsdp:2.0:User': z
      .object({
        organization: scimReference.optional(),
        emailVerified: z.boolean().optional(),
        phoneVerified: z.boolean().optional(),
      })
      .optional(),
  }),
);

const scimDevice = scimResource.merge(
  z.object({
    loginId: z.string(),
    active: z.boolean(),
    organization: scimReference,
    application: scimReference,
  }),
);

const scimService = scimResource.merge(
  z.object({
    serviceId: z.string(),
    active: z.boolean(),
    organization: scimReference,
    application: scimReference,
    expiresOn: z.string(),
  }),
);

const scimGroup = z.object({
  description: z.string().optional(),
  organization: scimReference,
  groupMembers: scimListResponse(z.union([scimUser, scimDevice, scimService])).optional(),
});

const scimGroupResponse = scimResource.merge(
  z.object({
    displayName: z.string().optional(),
    'urn:ietf:params:scim:schemas:extension:philips:hsdp:2.0:Group': scimGroup,
  }),
);

type ScimGroupResponse = z.infer<typeof scimGroupResponse>;
type ScimUser = z.infer<typeof scimUser>;
type ScimDevice = z.infer<typeof scimDevice>;
type ScimService = z.infer<typeof scimService>;

export type UserInGroup = {
  active: boolean;
  type: 'USER';
  userId: string;
  userName: string;
  name: ScimUser['name'];
  emails: string[];
};
export type DeviceInGroup = {
  active: boolean;
  type: 'DEVICE';
  loginId: string;
};
export type ServiceInGroup = {
  active: boolean;
  type: 'SERVICE';
  serviceId: string;
  expiresOn: string;
};

export type Member = UserInGroup | DeviceInGroup | ServiceInGroup;

export type Group = {
  id: string;
  description?: string;
  managingOrganization: string;
  members: Member[];
};

type GroupByIdParams = AuthParams & {
  id: string;
  includeGroupMembersType?: 'USER' | 'DEVICE' | 'SERVICE';
  groupMembersStartIndex?: number;
  groupMembersCount?: number;
  attributes?: string;
  excludedAttributes?: string;
};

export function createScimGroupsClient(options: ClientOptions) {
  const axiosInstance = axios.create({ baseURL: options.idmUrl + '/authorize/scim/v2/Groups' });

  const client = {
    async getGroupById(params: GroupByIdParams): Promise<Group> {
      const response = await axiosInstance.get<ScimGroupResponse>(`/${params.id}`, {
        params,
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'API-Version': 1,
        },
      });

      console.log(response.data);

      const responseData = scimGroupResponse.parse(response.data);
      const members =
        responseData[
          'urn:ietf:params:scim:schemas:extension:philips:hsdp:2.0:Group'
        ].groupMembers?.Resources.map((r): Member => {
          if (r.schemas.includes(USER_SCHEMA)) {
            const user = r as ScimUser;
            return {
              active: user.active,
              type: 'USER',
              userId: user.id,
              userName: user.userName,
              name: user.name,
              emails: user.emails.map((e) => e.value),
            };
          }
          if (r.schemas.includes(DEVICE_SCHEMA)) {
            const device = r as ScimDevice;
            return {
              active: device.active,
              type: 'DEVICE',
              loginId: device.loginId,
            };
          }
          if (r.schemas.includes(SERVICE_SCHEMA)) {
            const service = r as ScimService;
            return {
              active: service.active,
              type: 'SERVICE',
              serviceId: service.serviceId,
              expiresOn: service.expiresOn,
            };
          }
          throw Error(`Unsupported member type '${r.schemas.join(',')}'!`);
        }) || [];
      return {
        id: responseData.id,
        description:
          responseData['urn:ietf:params:scim:schemas:extension:philips:hsdp:2.0:Group'].description,
        managingOrganization:
          responseData['urn:ietf:params:scim:schemas:extension:philips:hsdp:2.0:Group'].organization
            .value,
        members,
      };
    },
  };
  return client;
}
