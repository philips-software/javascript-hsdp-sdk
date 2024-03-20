import nock from 'nock';
import {
  ForbiddenError,
  HSDPError,
  InvalidParametersError,
  ResourceAlreadyExistsError,
  ResourceNotFoundError,
  UnauthorizedError,
  wrapWithErrorHandling,
} from '../exceptions';
import { IamPermission } from './iam-permissions';
import { createRolesClient } from './roles';

const IDM_URL = 'http://localhost';
const ROLES_ENDPOINT = IDM_URL + '/authorize/identity/Role';
const ACCESS_TOKEN = 'ACCCESS_TOKEN';

const MOCK_ROLES = [
  {
    name: 'ROLE1',
    description: 'Role 1',
    managingOrganization: '56d97c6c-398f-456d-9bde-b70066fbad09',
    id: '8aa8723e-30a9-48de-9dc3-6102f0fcf6e1',
  },
  {
    name: 'ROLE2',
    managingOrganization: '56d97c6c-398f-456d-9bde-b70066fbad09',
    id: 'e73c597e-db92-41d5-a129-aa8e94fb66c4',
  },
];
const ROLES_LIST_RESPONSE = {
  total: MOCK_ROLES.length,
  entry: MOCK_ROLES,
};

const forEachStatusCode = it.each`
  statusCode | expectedException
  ${400}     | ${InvalidParametersError}
  ${401}     | ${UnauthorizedError}
  ${403}     | ${ForbiddenError}
  ${404}     | ${ResourceNotFoundError}
  ${409}     | ${ResourceAlreadyExistsError}
  ${500}     | ${HSDPError}
`;

const client = wrapWithErrorHandling(createRolesClient({ idmUrl: IDM_URL }));

describe('Roles', () => {
  describe('searchRoles', () => {
    it('filters by name', async () => {
      const scope = nock(ROLES_ENDPOINT)
        .get('/')
        .query({ name: 'blaat' })
        .reply(200, ROLES_LIST_RESPONSE);

      await client.searchRoles({
        accessToken: ACCESS_TOKEN,
        name: 'blaat',
      });

      expect(scope.isDone());
    });

    it('filters by organization id', async () => {
      const scope = nock(ROLES_ENDPOINT)
        .get('/')
        .query({ organizationId: '1234' })
        .reply(200, ROLES_LIST_RESPONSE);
      await client.searchRoles({
        accessToken: ACCESS_TOKEN,
        organizationId: '1234',
      });
      expect(scope.isDone());
    });

    it('filters by group id', async () => {
      const scope = nock(ROLES_ENDPOINT)
        .get('/')
        .query({ groupId: '1234' })
        .reply(200, ROLES_LIST_RESPONSE);
      await client.searchRoles({
        accessToken: ACCESS_TOKEN,
        groupId: '1234',
      });
      expect(scope.isDone());
    });

    it('returns a list of roles', async () => {
      const scope = nock(ROLES_ENDPOINT)
        .get('/')
        .query({ groupId: '1234' })
        .reply(200, ROLES_LIST_RESPONSE);
      const roles = await client.searchRoles({
        accessToken: ACCESS_TOKEN,
        groupId: '1234',
      });
      expect(scope.isDone());
      expect(roles.length).toEqual(2);
      expect(roles[0].name).toEqual('ROLE1');
      expect(roles[1].name).toEqual('ROLE2');
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(ROLES_ENDPOINT).get('/').reply(statusCode);
        await expect(
          client.searchRoles({
            accessToken: ACCESS_TOKEN,
          }),
        ).rejects.toThrow(expectedException);
      },
    );
  });

  describe('createRole', () => {
    it('returns created role', async () => {
      const scope = nock(ROLES_ENDPOINT)
        .post('/', {
          name: 'ROLE1',
          managingOrganization: '56d97c6c-398f-456d-9bde-b70066fbad09',
        })
        .reply(201, MOCK_ROLES[0]);
      const role = await client.createRole({
        accessToken: ACCESS_TOKEN,
        name: 'ROLE1',
        managingOrganization: '56d97c6c-398f-456d-9bde-b70066fbad09',
      });
      expect(scope.isDone()).toBeTruthy();
      expect(role.name).toEqual('ROLE1');
      expect(role.managingOrganization).toEqual('56d97c6c-398f-456d-9bde-b70066fbad09');
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(ROLES_ENDPOINT).post('/').reply(statusCode);
        await expect(
          client.createRole({
            accessToken: ACCESS_TOKEN,
            name: 'test',
            managingOrganization: 'some_org_id',
          }),
        ).rejects.toThrow(expectedException);
      },
    );
  });

  describe('deleteRole', () => {
    it('deletes the role', async () => {
      const scope = nock(ROLES_ENDPOINT).delete('/1').reply(204);
      await client.deleteRole({
        accessToken: ACCESS_TOKEN,
        id: '1',
      });
      expect(scope.isDone()).toBeTruthy();
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(ROLES_ENDPOINT).delete('/1').reply(statusCode);
        await expect(
          client.deleteRole({
            accessToken: ACCESS_TOKEN,
            id: '1',
          }),
        ).rejects.toThrow(expectedException);
      },
    );
  });

  describe('getRoleById', () => {
    it('returns the requested role', async () => {
      const scope = nock(ROLES_ENDPOINT).get('/1').reply(200, MOCK_ROLES[0]);
      const role = await client.getRoleById({
        accessToken: ACCESS_TOKEN,
        id: '1',
      });
      expect(scope.isDone()).toBeTruthy();
      expect(role.name).toEqual('ROLE1');
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(ROLES_ENDPOINT).get('/1').reply(statusCode);
        await expect(
          client.getRoleById({
            accessToken: ACCESS_TOKEN,
            id: '1',
          }),
        ).rejects.toThrow(expectedException);
      },
    );
  });

  describe('assignPermissionsToRole', () => {
    it('assigns permissions to role', async () => {
      const scope = nock(ROLES_ENDPOINT)
        .post('/1/$assign-permission', {
          permissions: [IamPermission.ACCOUNT_READ],
        })
        .reply(200);
      await client.assignPermissionsToRole({
        accessToken: ACCESS_TOKEN,
        roleId: '1',
        permissions: [IamPermission.ACCOUNT_READ],
      });
      expect(scope.isDone()).toBeTruthy();
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(ROLES_ENDPOINT).post('/1/$assign-permission').reply(statusCode);
        await expect(
          client.assignPermissionsToRole({
            accessToken: ACCESS_TOKEN,
            roleId: '1',
            permissions: [IamPermission.ACCOUNT_READ],
          }),
        ).rejects.toThrow(expectedException);
      },
    );
  });

  describe('removePermissionsFromRole', () => {
    it('removes permissions from role', async () => {
      const scope = nock(ROLES_ENDPOINT)
        .post('/1/$remove-permission', {
          permissions: [IamPermission.ACCOUNT_READ],
        })
        .reply(200);
      await client.removePermissionsFromRole({
        accessToken: ACCESS_TOKEN,
        roleId: '1',
        permissions: [IamPermission.ACCOUNT_READ],
      });
      expect(scope.isDone()).toBeTruthy();
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(ROLES_ENDPOINT).post('/1/$remove-permission').reply(statusCode);
        await expect(
          client.removePermissionsFromRole({
            accessToken: ACCESS_TOKEN,
            roleId: '1',
            permissions: [IamPermission.ACCOUNT_READ],
          }),
        ).rejects.toThrow(expectedException);
      },
    );
  });
});
