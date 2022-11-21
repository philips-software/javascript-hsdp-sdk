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

const CDR_URL = 'http://localhost';
const ORGANIZATIONS_ENPOINT = CDR_URL + '/Organization';
const ACCESS_TOKEN = 'ACCCESS_TOKEN';

const TEST_ORG = {
  resourceType: 'Organization',
  id: '1234',
  name: 'test',
  identifier: [
    {
      use: 'usual',
      system: 'https://identity.philips-healthsuite.com/organization',
      value: '1234',
    },
  ],
  active: true,
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

const client = wrapWithErrorHandling(createOrganizationsClient({ cdrUrl: CDR_URL }));

describe('CDR Organizations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    nock.cleanAll();
  });

  describe('onboard', () => {
    it('onboards successfully', async () => {
      const scope = nock(ORGANIZATIONS_ENPOINT)
        .put('/1234', {
          resourceType: 'Organization',
          id: '1234',
          name: 'test',
          identifier: [
            {
              use: 'usual',
              system: 'https://identity.philips-healthsuite.com/organization',
              value: '1234',
            },
          ],
          active: true,
        })
        .reply(200, TEST_ORG);

      await client.onboard({
        accessToken: ACCESS_TOKEN,
        orgId: '1234',
        name: 'test',
      });

      expect(scope.isDone());
    });
  });

  forEachStatusCode(
    'returns a $expectedException on status $statusCode ',
    async ({ statusCode, expectedException }) => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      jest.spyOn(console, 'error').mockImplementation(() => {});

      nock(ORGANIZATIONS_ENPOINT).put('/1234').reply(statusCode, 'Something went wrong');
      await expect(
        client.onboard({
          accessToken: ACCESS_TOKEN,
          orgId: '1234',
          name: 'test',
        }),
      ).rejects.toThrowError(expectedException);
    },
  );

  describe('delete', () => {
    it('deletes successfully', async () => {
      const scope = nock(ORGANIZATIONS_ENPOINT).delete('/1234').reply(200, TEST_ORG);

      await client.delete({
        accessToken: ACCESS_TOKEN,
        orgId: '1234',
      });

      expect(scope.isDone());
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        jest.spyOn(console, 'error').mockImplementation(() => {});

        nock(ORGANIZATIONS_ENPOINT).delete('/1234').reply(statusCode, 'Something went wrong');
        await expect(
          client.delete({
            accessToken: ACCESS_TOKEN,
            orgId: '1234',
          }),
        ).rejects.toThrowError(expectedException);
      },
    );
  });

  describe('get', () => {
    it('gets successfully', async () => {
      const scope = nock(ORGANIZATIONS_ENPOINT).get('/1234').reply(200, TEST_ORG);

      await client.get({
        accessToken: ACCESS_TOKEN,
        orgId: '1234',
      });

      expect(scope.isDone());
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        jest.spyOn(console, 'error').mockImplementation(() => {});

        nock(ORGANIZATIONS_ENPOINT).get('/1234').reply(statusCode, 'Something went wrong');
        await expect(
          client.get({
            accessToken: ACCESS_TOKEN,
            orgId: '1234',
          }),
        ).rejects.toThrowError(expectedException);
      },
    );
  });

  describe('purge', () => {
    it('purges successfully', async () => {
      const scope = nock(CDR_URL).post('/$purge').reply(200, TEST_ORG);

      await client.purge({
        accessToken: ACCESS_TOKEN,
        orgId: '1234',
      });

      expect(scope.isDone());
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        jest.spyOn(console, 'error').mockImplementation(() => {});

        nock(CDR_URL).post('/$purge').reply(statusCode, 'Something went wrong');
        await expect(
          client.purge({
            accessToken: ACCESS_TOKEN,
            orgId: '1234',
          }),
        ).rejects.toThrowError(expectedException);
      },
    );
  });
});
