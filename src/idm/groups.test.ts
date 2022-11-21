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
import { createGroupsClient } from './groups';

const IDM_URL = 'http://localhost';
const ACCESS_TOKEN = 'ACCCESS_TOKEN';
const GROUPS_ENDPOINT = IDM_URL + '/authorize/identity/Group';

const MOCK_SEARCH_GROUPS = [
  {
    resource: {
      resourceType: 'Group',
      groupName: 'Group 1',
      orgId: '4',
      _id: '1',
    },
  },
  {
    resource: {
      resourceType: 'Group',
      groupName: 'Group 2',
      orgId: '3',
      _id: '2',
    },
  },
];

const MOCK_GROUPS = [
  {
    name: 'Group 1',
    managingOrganization: '4',
    id: '1',
  },
  {
    name: 'Group 2',
    managingOrganization: '3',
    id: '2',
  },
];

const GROUP_LIST_RESPONSE = {
  resourceType: 'bundle',
  type: 'searchset',
  total: 2,
  entry: MOCK_SEARCH_GROUPS,
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

const client = wrapWithErrorHandling(createGroupsClient({ idmUrl: IDM_URL }));

describe('IDM Groups', () => {
  describe('searchGroups', () => {
    it('searches by name', async () => {
      const scope = nock(GROUPS_ENDPOINT)
        .get('/')
        .query({
          organizationId: '1234',
          name: 'bla',
        })
        .reply(200, GROUP_LIST_RESPONSE);

      await client.searchGroups({
        accessToken: ACCESS_TOKEN,
        organizationId: '1234',
        name: 'bla',
      });
      expect(scope.isDone()).toBeTruthy();
    });

    it('searches by member type', async () => {
      const scope = nock(GROUPS_ENDPOINT)
        .get('/')
        .query({
          organizationId: '1234',
          memberType: 'DEVICE',
        })
        .reply(200, GROUP_LIST_RESPONSE);

      await client.searchGroups({
        accessToken: ACCESS_TOKEN,
        organizationId: '1234',
        memberType: 'DEVICE',
      });
      expect(scope.isDone()).toBeTruthy();
    });

    it('searches by member id', async () => {
      const scope = nock(GROUPS_ENDPOINT)
        .get('/')
        .query({
          organizationId: '1234',
          memberId: '456',
          memberType: 'DEVICE',
        })
        .reply(200, GROUP_LIST_RESPONSE);

      await client.searchGroups({
        accessToken: ACCESS_TOKEN,
        organizationId: '1234',
        memberId: '456',
        memberType: 'DEVICE',
      });
      expect(scope.isDone()).toBeTruthy();
    });

    it('returns a list of groups', async () => {
      const scope = nock(GROUPS_ENDPOINT)
        .get('/')
        .query({
          organizationId: '1234',
        })
        .reply(200, GROUP_LIST_RESPONSE);

      const groups = await client.searchGroups({
        accessToken: ACCESS_TOKEN,
        organizationId: '1234',
      });
      expect(scope.isDone()).toBeTruthy();
      expect(groups.length).toEqual(2);
      expect(groups[0].name).toEqual('Group 1');
      expect(groups[1].name).toEqual('Group 2');
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(GROUPS_ENDPOINT).get('/').query({ organizationId: '1234' }).reply(statusCode);
        await expect(
          client.searchGroups({
            accessToken: ACCESS_TOKEN,
            organizationId: '1234',
          }),
        ).rejects.toThrowError(expectedException);
      },
    );
  });

  describe('createGroup', () => {
    it('returns the created group', async () => {
      const scope = nock(GROUPS_ENDPOINT).post('/').reply(201, MOCK_GROUPS[0]);
      const group = await client.createGroup({
        accessToken: ACCESS_TOKEN,
        name: 'Group 1',
        managingOrganization: '1234',
      });
      expect(scope.isDone()).toBeTruthy();
      expect(group.name).toEqual('Group 1');
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(GROUPS_ENDPOINT).post('/').reply(statusCode);
        await expect(
          client.createGroup({
            accessToken: ACCESS_TOKEN,
            name: 'Group 1',
            managingOrganization: '1234',
          }),
        ).rejects.toThrowError(expectedException);
      },
    );
  });

  describe('deleteGroup', () => {
    it('deletes the role', async () => {
      const scope = nock(GROUPS_ENDPOINT).delete('/1').reply(204);
      await client.deleteGroup({
        accessToken: ACCESS_TOKEN,
        id: '1',
      });
      expect(scope.isDone()).toBeTruthy();
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(GROUPS_ENDPOINT).delete('/1').reply(statusCode);
        await expect(
          client.deleteGroup({
            accessToken: ACCESS_TOKEN,
            id: '1',
          }),
        ).rejects.toThrowError(expectedException);
      },
    );
  });

  describe('getGroupById', () => {
    it('returns the requested role', async () => {
      const scope = nock(GROUPS_ENDPOINT).get('/1').reply(200, MOCK_GROUPS[0]);
      const role = await client.getGroupById({
        accessToken: ACCESS_TOKEN,
        id: '1',
      });
      expect(scope.isDone()).toBeTruthy();
      expect(role.name).toEqual('Group 1');
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(GROUPS_ENDPOINT).get('/1').reply(statusCode);
        await expect(
          client.getGroupById({
            accessToken: ACCESS_TOKEN,
            id: '1',
          }),
        ).rejects.toThrowError(expectedException);
      },
    );
  });

  describe('addMembersToGroup', () => {
    it('adds members to the specified group', async () => {
      const scope = nock(GROUPS_ENDPOINT).post('/1/$add-members').reply(200);
      await client.addMembersToGroup({
        accessToken: ACCESS_TOKEN,
        groupId: '1',
        userIds: ['1', '2'],
      });
      expect(scope.isDone()).toBeTruthy();
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(GROUPS_ENDPOINT).post('/1/$add-members').reply(statusCode);
        await expect(
          client.addMembersToGroup({
            accessToken: ACCESS_TOKEN,
            groupId: '1',
            userIds: ['1', '2'],
          }),
        ).rejects.toThrowError(expectedException);
      },
    );
  });
  describe('removeMembersFromGroup', () => {
    it('removes members from the specified group', async () => {
      const scope = nock(GROUPS_ENDPOINT).post('/1/$remove-members').reply(200);
      await client.removeMembersFromGroup({
        accessToken: ACCESS_TOKEN,
        groupId: '1',
        userIds: ['1', '2'],
      });
      expect(scope.isDone()).toBeTruthy();
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(GROUPS_ENDPOINT).post('/1/$remove-members').reply(statusCode);
        await expect(
          client.removeMembersFromGroup({
            accessToken: ACCESS_TOKEN,
            groupId: '1',
            userIds: ['1', '2'],
          }),
        ).rejects.toThrowError(expectedException);
      },
    );
  });

  describe('assignRolesToGroup', () => {
    it('assigns roles to the specified group', async () => {
      const scope = nock(GROUPS_ENDPOINT).post('/1/$assign-role').reply(200);
      await client.assignRolesToGroup({
        accessToken: ACCESS_TOKEN,
        groupId: '1',
        roleIds: ['1', '2'],
      });
      expect(scope.isDone()).toBeTruthy();
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(GROUPS_ENDPOINT).post('/1/$assign-role').reply(statusCode);
        await expect(
          client.assignRolesToGroup({
            accessToken: ACCESS_TOKEN,
            groupId: '1',
            roleIds: ['1', '2'],
          }),
        ).rejects.toThrowError(expectedException);
      },
    );
  });

  describe('removeRolesFromGroup', () => {
    it('removes members from the specified group', async () => {
      const scope = nock(GROUPS_ENDPOINT).post('/1/$remove-role').reply(200);
      await client.removeRolesFromGroup({
        accessToken: ACCESS_TOKEN,
        groupId: '1',
        roleIds: ['1', '2'],
      });
      expect(scope.isDone()).toBeTruthy();
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(GROUPS_ENDPOINT).post('/1/$remove-role').reply(statusCode);
        await expect(
          client.removeRolesFromGroup({
            accessToken: ACCESS_TOKEN,
            groupId: '1',
            roleIds: ['1', '2'],
          }),
        ).rejects.toThrowError(expectedException);
      },
    );
  });
});
