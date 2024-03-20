import { BinaryLike, createHmac } from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const omitKeys = <T extends Record<string, any>>(object: T, keys: (keyof T)[]) =>
  Object.keys(object)
    .filter((k) => !keys.includes(k))
    .reduce((result, key) => ({ ...result, [key]: object[key] }), {});

const sign = (secret: BinaryLike, challenge: BinaryLike) => {
  const signHmac = createHmac('sha256', secret);
  signHmac.update(challenge);
  return signHmac.digest();
};

export const generateHSDPApiSignature = (sharedKey: string, secretKey: string) => {
  const secretString = `DHPWS${secretKey}`;
  const now = new Date();
  const dateString = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}T${now.getUTCHours()}:${now.getUTCMinutes()}:${now.getUTCSeconds()}Z`;
  const seed = Buffer.from(dateString, 'utf8');
  const signature = sign(secretString, seed.toString('base64'));
  return {
    'HSDP-API-Signature': `HmacSHA256;Credential:${sharedKey};SignedHeaders:SignedDate;Signature:${signature.toString('base64')}`,
    SignedDate: dateString,
  };
};

export function encodeCredentials(clientId: string, clientSecret: string) {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64');
  return { Authorization: `Basic ${credentials}` };
}
