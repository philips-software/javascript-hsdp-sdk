import axios from 'axios';
import jwt from 'jsonwebtoken';

function generateServiceJWT(
  hsdpIamUrl: string,
  serviceId: string,
  privateKey: string,
  expiresInSeconds: number,
) {
  const payload = {
    aud: [`${hsdpIamUrl}/oauth2/access_token`],
    iss: serviceId,
    sub: serviceId,
    mth: 'POST',
  };
  return jwt.sign(payload, privateKey, { expiresIn: expiresInSeconds, algorithm: 'RS256' });
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
  const jwtToken = generateServiceJWT(
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
