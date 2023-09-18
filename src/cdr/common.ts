export type ClientOptions = {
  cdrUrl: string;
};

export type AuthParams = {
  accessToken: string;
};

export type ParamOptions = Partial<{
  validateResource: boolean;
}>;
