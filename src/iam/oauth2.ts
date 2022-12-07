import axios from 'axios';
import { KJUR } from 'jsrsasign';

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

  return axios
    .post<IntrospectResponse>(
      `${hsdpIamUrl}/authorize/oauth2/introspect`,
      searchParams.toString(),
      {
        headers: {
          Accept: 'application/json',
          'Api-version': '4',
          ...encodeCredentials(params.clientId, params.clientSecret),
        },
      },
    )
    .then((r) => r.data);
}

function encodeCredentials(clientId: string, clientSecret: string) {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64');
  return { Authorization: `Basic ${credentials}` };
}
