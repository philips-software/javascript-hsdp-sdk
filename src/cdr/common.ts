export type ClientOptions = {
  cdrUrl: string;
};

export type AuthParams = {
  accessToken: string;
};

export type ParamOptions = Partial<{
  validateResource: boolean;
}>;

export function getHeadersFromOptions(options: ParamOptions) {
  const headers: Record<string, string> = {};
  if (options?.validateResource !== undefined) {
    headers['X-validate-resource'] = options.validateResource ? 'true' : 'false';
  }
  return headers;
}
