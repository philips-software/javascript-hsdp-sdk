import axios from 'axios';
import { AuthParams, ClientOptions } from './common';
import { omitKeys } from './utils';

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

  const client = {
    searchUsers,
  };
  return client;
}
