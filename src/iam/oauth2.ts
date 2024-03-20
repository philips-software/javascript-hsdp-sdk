import axios from 'axios';
import { KJUR } from 'jsrsasign';
import { encodeCredentials } from '../idm/utils';

async function generateServiceJWT(
  hsdpIamUrl: string,
  serviceId: string,
  privateKey: string,
  expiresInSeconds: number,
) {
  const header = {
    typ: 'JWT',
    alg: 'RS256',
  };
  const payload = {
    aud: [`${hsdpIamUrl}/oauth2/access_token`],
    iss: serviceId,
    sub: serviceId,
    exp: Math.round(new Date().getTime() / 1000) + expiresInSeconds,
  };

  try {
    const singleLinePrivateKey = privateKey.replace(/(?:\\r\\n|\\r|\\n)/g, '');
    return KJUR.jws.JWS.sign(
      header.alg,
      JSON.stringify(header),
      JSON.stringify(payload),
      singleLinePrivateKey,
    );
  } catch (e) {
    throw new Error(`JWT Signing failed: ${(e as Error).message}`);
  }
}

export type LoginServiceResponse = {
  access_token: string;
  id_token: string;
  scope: string;
  expires_in: string;
  token_type: string;
};

export type LoginServiceParams = {
  expiresIn: number;
  scope: string;
};

export async function loginWithServiceAccount(
  hsdpIamUrl: string,
  serviceId: string,
  privateKey: string,
  params?: Partial<LoginServiceParams>,
) {
  const jwtToken = await generateServiceJWT(
    hsdpIamUrl,
    serviceId,
    privateKey,
    params?.expiresIn || 5 * 60,
  );
  const searchParams = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwtToken,
    ...(params?.scope ? { scope: params.scope } : {}),
  });

  const response = await axios.post<LoginServiceResponse>(
    `${hsdpIamUrl}/authorize/oauth2/token`,
    searchParams.toString(),
    {
      headers: {
        Accept: 'application/json',
        'Api-version': '2',
      },
    },
  );
  return response.data;
}

interface LoginUserParams {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  scope?: string;
}

export type LoginUserResponse = {
  access_token: string;
  refresh_token: string;
  scope: string;
  expires_in: number;
  token_type: string;
};

export async function loginAsUser(hsdpIamUrl: string, params: LoginUserParams) {
  const searchParams = new URLSearchParams({
    grant_type: 'password',
    username: params.username,
    password: params.password,
    ...(params.scope ? { scope: params.scope } : {}),
  });

  const response = await axios.post<LoginUserResponse>(
    `${hsdpIamUrl}/authorize/oauth2/token`,
    searchParams.toString(),
    {
      headers: {
        Accept: 'application/json',
        'Api-version': '2',
        ...encodeCredentials(params.clientId, params.clientSecret),
      },
    },
  );
  return response.data;
}

export declare type IntrospectResponse = {
  active: boolean;
  scope: string;
  username: string;
  exp: number;
  sub: string;
  iss: string;
  organizations: {
    managingOrganization: string;
    organizationList: Array<{
      organizationId: string;
      permissions: string[];
      organizationName: string;
      groups: string[];
      roles: string[];
    }>;
  };
  client_id: string;
  token_type: string;
  identity_type: string;
};

interface IntrospectParams {
  clientId: string;
  clientSecret: string;
  accessToken: string;
}

export async function introspect(hsdpIamUrl: string, params: IntrospectParams) {
  const searchParams = new URLSearchParams({
    token: params.accessToken,
  });

  const response = await axios.post<IntrospectResponse>(
    `${hsdpIamUrl}/authorize/oauth2/introspect`,
    searchParams.toString(),
    {
      headers: {
        Accept: 'application/json',
        'Api-version': '4',
        ...encodeCredentials(params.clientId, params.clientSecret),
      },
    },
  );
  return response.data;
}

type RefreshAccessTokenParams = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};

export async function refreshAccessToken(hsdpIamUrl: string, params: RefreshAccessTokenParams) {
  const searchParams = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: params.refreshToken,
  });

  const response = await axios.post<LoginUserResponse>(
    `${hsdpIamUrl}/authorize/oauth2/token`,
    searchParams.toString(),
    {
      headers: {
        Accept: 'application/json',
        'Api-version': '2',
        ...encodeCredentials(params.clientId, params.clientSecret),
      },
    },
  );
  return response.data;
}

type LogoutParams = {
  clientId: string;
  clientSecret: string;
  accessToken: string;
};

export async function logout(hsdpIamUrl: string, params: LogoutParams) {
  const searchParams = new URLSearchParams({
    token: params.accessToken,
  });

  await axios.post(`${hsdpIamUrl}/authorize/oauth2/revoke`, searchParams.toString(), {
    headers: {
      Accept: 'application/json',
      'Api-version': '2',
      ...encodeCredentials(params.clientId, params.clientSecret),
    },
  });
}
type AuthorizeCodeParams = {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
};

export async function authorizeCode(hsdpIamUrl: string, params: AuthorizeCodeParams) {
  const searchParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code: params.code,
    redirect_uri: params.redirectUri,
  });

  const response = await axios.post<LoginUserResponse>(
    `${hsdpIamUrl}/authorize/oauth2/token`,
    searchParams.toString(),
    {
      headers: {
        Accept: 'application/json',
        'Api-version': '2',
        ...encodeCredentials(params.clientId, params.clientSecret),
      },
    },
  );
  return response.data;
}
