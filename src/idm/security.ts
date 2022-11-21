import axios from 'axios';
import { AuthParams, ClientOptions } from './common';

type ListUserParams = AuthParams & {
  organizationID?: string;
  loginID?: string;
  groupID?: string;
  pageSize?: string;
  pageNumber?: string;
};

type LegacyUser = {
  userUUID: string;
};

type ListUserResponse = {
  exchange: {
    users: LegacyUser[];
    nextPageExists: false;
  };
  responseCode: string;
  responseMessage: string;
};
export function createSecurityClient(options: ClientOptions) {
  const axiosInstance = axios.create({ baseURL: options.idmUrl + '/security' });
  return {
    async listUsers(params: ListUserParams): Promise<ListUserResponse> {
      const users = await axiosInstance.get<ListUserResponse>('/users', {
        params,
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      });
      return users.data;
    },
  };
}
