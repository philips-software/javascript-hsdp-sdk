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
import { createOrganizationsClient } from './organizations';
import { FindOrganizationByParentIdFilter } from './filters';

const IDM_URL = 'http://localhost';
const ORGS_ENDPOINT = IDM_URL + '/authorize/scim/v2/Organizations';
const ACCESS_TOKEN = 'ACCCESS_TOKEN';

const MOCK_ORGANIZATIONS = [
  {
    schemas: ['urn:ietf:params:scim:schemas:core:philips:hsdp:2.0:Organization'],
    id: '0146772f-fd54-4c11-a2b8-5b06c532ad9b',
    name: 'Org 1',
    description: 'Some org',
    parent: {
      value: '3a005501-bb4f-4931-9ee4-7ec3a1fea318',
    },
    active: true,
    inheritProperties: true,
    owners: [
      {
        value: '04a2e2b5-50f6-4a8a-829a-123e5415bd41',
        primary: true,
      },
    ],
    createdBy: {
      value: '04a2e2b5-50f6-4a8a-829a-123e5415bd41',
    },
    modifiedBy: {
      value: '04a2e2b5-50f6-4a8a-829a-123e5415bd41',
    },
    meta: {
      resourceType: 'Organization',
      created: '2022-04-08T15:38:08.945Z',
      lastModified: '2022-04-08T15:38:08.945Z',
      version: 'W/"994206677"',
    },
  },
  {
    schemas: ['urn:ietf:params:scim:schemas:core:philips:hsdp:2.0:Organization'],
    id: '08adaaf5-4b1a-4b4e-8d5a-6ab452716506',
    name: 'Org 2',
    description: 'Some org 2',
    parent: {
      value: '3a005501-bb4f-4931-9ee4-7ec3a1fea318',
    },
    active: true,
    inheritProperties: true,
    owners: [
      {
        value: '04a2e2b5-50f6-4a8a-829a-123e5415bd41',
        primary: true,
      },
    ],
    createdBy: {
      value: '04a2e2b5-50f6-4a8a-829a-123e5415bd41',
    },
    modifiedBy: {
      value: '04a2e2b5-50f6-4a8a-829a-123e5415bd41',
    },
    meta: {
      resourceType: 'Organization',
      created: '2022-04-05T09:24:02.035Z',
      lastModified: '2022-04-05T09:24:02.035Z',
      version: 'W/"240605208"',
    },
  },
];
const ORGANIZATION_LIST_RESPONSE = {
  schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
  totalResults: -1,
  Resources: MOCK_ORGANIZATIONS,
  startIndex: 1,
  itemsPerPage: 27,
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

const client = wrapWithErrorHandling(createOrganizationsClient({ idmUrl: IDM_URL }));

describe('HSDP IDM organizations', () => {
  describe('searchOrganizations', () => {
    it('passes filter', async () => {
      const scope = nock(ORGS_ENDPOINT)
        .get('/')
        .query({ filter: 'parent.value eq "123"' })
        .reply(200, ORGANIZATION_LIST_RESPONSE);
      await client.searchOrganizations({
        accessToken: ACCESS_TOKEN,
        filter: FindOrganizationByParentIdFilter('123'),
      });
      expect(scope.isDone());
    });

    it('passes startIndex', async () => {
      const scope = nock(ORGS_ENDPOINT)
        .get('/')
        .query({ startIndex: 2 })
        .reply(200, ORGANIZATION_LIST_RESPONSE);
      await client.searchOrganizations({
        accessToken: ACCESS_TOKEN,
        startIndex: 2,
      });
      expect(scope.isDone());
    });

    it('passes count', async () => {
      const scope = nock(ORGS_ENDPOINT)
        .get('/')
        .query({ count: 10 })
        .reply(200, ORGANIZATION_LIST_RESPONSE);
      await client.searchOrganizations({
        accessToken: ACCESS_TOKEN,
        count: 10,
      });
      expect(scope.isDone());
    });

    it('returns a list of organizations', async () => {
      const scope = nock(ORGS_ENDPOINT).get('/').reply(200, ORGANIZATION_LIST_RESPONSE);
      const organizations = await client.searchOrganizations({
        accessToken: ACCESS_TOKEN,
      });
      expect(scope.isDone());
      expect(organizations.length).toEqual(2);
      expect(organizations[0].name).toEqual('Org 1');
      expect(organizations[1].name).toEqual('Org 2');
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(ORGS_ENDPOINT).get('/').reply(statusCode);
        await expect(
          client.searchOrganizations({
            accessToken: ACCESS_TOKEN,
          }),
        ).rejects.toThrowError(expectedException);
      },
    );
  });

  describe('createOrganization', () => {
    it('creates an organization', async () => {
      const scope = nock(ORGS_ENDPOINT)
        .post('/', {
          schemas: ['urn:ietf:params:scim:schemas:core:philips:hsdp:2.0:Organization'],
          name: 'Org 1',
          parent: {
            value: '1234',
          },
        })
        .reply(201, MOCK_ORGANIZATIONS[0]);
      const organization = await client.createOrganization({
        accessToken: ACCESS_TOKEN,
        name: 'Org 1',
        parentId: '1234',
      });
      expect(scope.isDone());
      expect(organization.name).toEqual('Org 1');
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(ORGS_ENDPOINT).post('/').reply(statusCode);
        await expect(
          client.createOrganization({
            accessToken: ACCESS_TOKEN,
            name: 'bla',
            parentId: '12345',
          }),
        ).rejects.toThrowError(expectedException);
      },
    );
  });

  describe('getOrganizationById', () => {
    it('returns the requested organization', async () => {
      const scope = nock(ORGS_ENDPOINT).get('/1').reply(200, MOCK_ORGANIZATIONS[0]);
      const organization = await client.getOrganizationById({
        accessToken: ACCESS_TOKEN,
        id: '1',
      });
      expect(scope.isDone());
      expect(organization.name).toEqual('Org 1');
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(ORGS_ENDPOINT).get('/1').reply(statusCode);
        await expect(
          client.getOrganizationById({
            accessToken: ACCESS_TOKEN,
            id: '1',
          }),
        ).rejects.toThrowError(expectedException);
      },
    );
  });

  describe('deleteOrganizationById', () => {
    it('deletes the requested organization', async () => {
      const scope = nock(ORGS_ENDPOINT).delete('/1').matchHeader('If-Method', 'DELETE').reply(202);
      await client.deleteOrganizationById({
        accessToken: ACCESS_TOKEN,
        id: '1',
      });
      expect(scope.isDone());
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(ORGS_ENDPOINT).delete('/1').reply(statusCode);
        await expect(
          client.deleteOrganizationById({
            accessToken: ACCESS_TOKEN,
            id: '1',
          }),
        ).rejects.toThrowError(expectedException);
      },
    );
  });
});
