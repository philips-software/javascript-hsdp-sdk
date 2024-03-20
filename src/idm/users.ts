import axios from 'axios';
import { AuthParams, ClientOptions, HSDPRootOrgKeys } from './common';
import { generateHSDPApiSignature, omitKeys } from './utils';

type BaseSearchUsersParams = AuthParams & {
  userId: string;
};

type SearchUsersPasswordStatusParams = BaseSearchUsersParams & { profileType: 'passwordStatus' };
type SearchUsersAccountStatusParams = BaseSearchUsersParams & { profileType: 'accountStatus' };
type SearchUsersMembershipsParams = BaseSearchUsersParams & { profileType: 'membership' };
type SearchUsersConsentedAppsParams = BaseSearchUsersParams & { profileType: 'consentedApps' };

// TODO: add
// | 'delegations'
// | 'all';
type SearchUsersParams =
  | SearchUsersAccountStatusParams
  | SearchUsersPasswordStatusParams
  | SearchUsersMembershipsParams
  | SearchUsersConsentedAppsParams;

export type User = {
  preferredLanguage: string;
  preferredCommunicationChannel: string;
  emailAddress: string;
  phoneNumber: string;
  id: string;
  loginId: string;
  name: {
    given: string;
    family: string;
  };
  managingOrganization: string;
};

export type UserAccountStatus = {
  accountStatus: {
    lastLoginTime: string;
    mfaStatus: string;
    phoneVerified: boolean;
    emailVerified: boolean;
    mustChangePassword: boolean;
    disabled: boolean;
    accountLockedOn: string;
    accountLockedUntil: string;
    numberOfInvalidAttempt: number;
    lastInvalidAttemptedOn: string;
  };
};
export type UserPasswordStatus = {
  passwordStatus: {
    passwordExpiresOn: string;
    passwordChangedOn: string | null;
    mustChangePassword: boolean;
  };
};

export type UserMembership = {
  memberships: {
    organizationId: string;
    organizationName: string;
    roles: string[];
    groups: string[];
  }[];
};

export type UserConsentedApps = {
  consentedApps: string[];
};

type UserListResponse<T extends User[]> = {
  total: number;
  entry: T;
};

export type CreateUserParams = AuthParams & {
  loginId: string;
  name: User['name'];
  password?: string;
  email: string;
  managingOrganization?: string;
  preferredLanguage?: string;
  preferredCommunicationChannel?: string;
};

export type RequestPasswordResetParams = AuthParams & {
  loginId: string;
};

export type SetPasswordParams = AuthParams &
  HSDPRootOrgKeys & {
    loginId: string;
    confirmationCode: string;
    newPassword: string;
    context: 'userCreate' | 'recoverPassword';
  };

type SearchUsersResponse<ProfileType extends SearchUsersParams['profileType']> = (User &
  (ProfileType extends 'membership'
    ? UserMembership
    : ProfileType extends 'accountStatus'
      ? UserAccountStatus
      : ProfileType extends 'passwordStatus'
        ? UserPasswordStatus
        : ProfileType extends 'consentedApps'
          ? UserConsentedApps
          : never))[];

type OperationOutcome = {
  resourceType?: string;
  issue: {
    severity: 'error' | 'warning' | 'information' | 'fatal';
    code: string;
    details: {
      description?: string;
      text?: string;
      coding: {
        system: string;
        version: string;
        code: string;
        display: string;
        userSelected: boolean;
      };
      diagnostics?: string;
      location?: string[];
    };
  }[];
};

export type CreateUserResponse = {
  created: boolean;
  email: string;
  id?: string;
};

type CreateUserResponseHeaders = {
  location?: string;
};

export function createUsersClient(options: ClientOptions) {
  const axiosInstance = axios.create({ baseURL: options.idmUrl + '/authorize/identity/User' });

  async function searchUsers<Params extends SearchUsersParams>(
    params: Params,
  ): Promise<SearchUsersResponse<Params['profileType']>> {
    const response = await axiosInstance.get<
      UserListResponse<SearchUsersResponse<Params['profileType']>>
    >('/', {
      params: omitKeys(params, ['accessToken']),
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        'API-Version': 3,
      },
    });

    return response.data.entry;
  }

  async function createUser(params: CreateUserParams): Promise<CreateUserResponse> {
    const apiParams = {
      resourceType: 'Person',
      loginId: params.loginId,
      name: params.name,
      telecom: [
        {
          system: 'email',
          value: params.email,
        },
      ],
      password: params.password,
      managingOrganization: params.managingOrganization,
      preferredLanguage: params.preferredLanguage,
      preferredCommunicationChannel: params.preferredCommunicationChannel,
    };
    const response = await axiosInstance.post<OperationOutcome>('/', apiParams, {
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        'API-Version': 4,
      },
    });
    const headers = response.headers as CreateUserResponseHeaders;
    return {
      created: headers.location !== undefined,
      email: params.email,
      id: headers.location ? headers.location.split('/').at(-1) : undefined,
    };
  }

  async function requestPasswordReset(params: RequestPasswordResetParams) {
    await axiosInstance.post(
      '/$reset-password',
      {
        loginId: params.loginId,
      },
      {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'API-Version': 1,
        },
      },
    );
  }

  async function setPassword(params: SetPasswordParams) {
    await axiosInstance.post(
      '/$set-password',
      {
        resourceType: 'Parameters',
        parameter: [
          {
            name: 'setPassword',
            resource: {
              loginId: params.loginId,
              confirmationCode: params.confirmationCode,
              newPassword: params.newPassword,
              context: params.context,
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'API-Version': 3,
          ...generateHSDPApiSignature(params.sharedKey, params.secretKey),
        },
      },
    );
  }

  const client = {
    searchUsers,
    createUser,
    requestPasswordReset,
    setPassword,
  };
  return client;
}
