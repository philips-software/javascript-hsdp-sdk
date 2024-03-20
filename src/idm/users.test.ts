import nock from 'nock';
import {
  HSDPError,
  InvalidParametersError,
  ResourceAlreadyExistsError,
  ResourceNotFoundError,
  UnauthorizedError,
  ForbiddenError,
  wrapWithErrorHandling,
} from '../exceptions';
import { createUsersClient } from './users';

const IDM_URL = 'http://localhost';
const USERS_ENDPOINT = IDM_URL + '/authorize/identity/User';
const ACCESS_TOKEN = 'ACCCESS_TOKEN';

const forEachStatusCode = it.each`
  statusCode | expectedException
  ${400}     | ${InvalidParametersError}
  ${401}     | ${UnauthorizedError}
  ${403}     | ${ForbiddenError}
  ${404}     | ${ResourceNotFoundError}
  ${409}     | ${ResourceAlreadyExistsError}
  ${500}     | ${HSDPError}
`;

const client = wrapWithErrorHandling(createUsersClient({ idmUrl: IDM_URL }));

describe('HSDP IDM users', () => {
  describe('searchUsers', () => {
    it('returns a user', async () => {
      const scope = nock(USERS_ENDPOINT)
        .get('/')
        .query({ userId: '123', profileType: 'accountStatus' })
        .reply(200);
      await client.searchUsers({
        accessToken: ACCESS_TOKEN,
        userId: '123',
        profileType: 'accountStatus',
      });
      expect(scope.isDone());
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(USERS_ENDPOINT)
          .get('/')
          .query({ userId: '123', profileType: 'accountStatus' })
          .reply(statusCode);
        await expect(
          client.searchUsers({
            accessToken: ACCESS_TOKEN,
            userId: '123',
            profileType: 'accountStatus',
          }),
        ).rejects.toThrow(expectedException);
      },
    );
  });

  describe('createUser', () => {
    it('creates a user', async () => {
      const scope = nock(USERS_ENDPOINT)
        .post('/')
        .reply(201, undefined, { location: 'http://localhost/authorize/identity/User/123' });
      const response = await client.createUser({
        accessToken: ACCESS_TOKEN,
        loginId: '123@123.com',
        email: '123@123.com',
        name: { given: '123', family: '456' },
        managingOrganization: '123',
        password: '123',
      });
      expect(scope.isDone()).toBeTruthy();
      expect(response.created).toBeTruthy();
      expect(response.email).toEqual('123@123.com');
      expect(response.id).toEqual('123');
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(USERS_ENDPOINT).post('/').reply(statusCode);
        await expect(
          client.createUser({
            accessToken: ACCESS_TOKEN,
            loginId: '123@123.com',
            email: '123@123.com',
            name: { given: '123', family: '456' },
            managingOrganization: '123',
            password: '123',
          }),
        ).rejects.toThrow(expectedException);
      },
    );
  });

  describe('requestPasswordReset', () => {
    it('calls hsdp IDM', async () => {
      const scope = nock(USERS_ENDPOINT).post('/$reset-password').reply(202);
      await client.requestPasswordReset({
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        loginId: '123@123.com',
      });
      expect(scope.isDone()).toBeTruthy();
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(USERS_ENDPOINT).post('/$reset-password').reply(statusCode);
        await expect(
          client.requestPasswordReset({
            clientId: 'clientId',
            clientSecret: 'clientSecret',
            loginId: '123@123.com',
          }),
        ).rejects.toThrow(expectedException);
      },
    );
  });

  describe('setPassword', () => {
    it('calls hsdp IDM', async () => {
      const scope = nock(USERS_ENDPOINT).post('/$set-password').reply(200);
      await client.setPassword({
        sharedKey: 'sharedKey',
        secretKey: 'secretKey',
        loginId: '123@123.com',
        confirmationCode: '123',
        newPassword: '123',
        context: 'userCreate',
      });
      expect(scope.isDone()).toBeTruthy();
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(USERS_ENDPOINT).post('/$set-password').reply(statusCode);
        await expect(
          client.setPassword({
            sharedKey: 'sharedKey',
            secretKey: 'secretKey',
            loginId: '123@123.com',
            confirmationCode: '123',
            newPassword: '123',
            context: 'userCreate',
          }),
        ).rejects.toThrow(expectedException);
      },
    );
  });
});
