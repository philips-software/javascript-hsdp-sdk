import {
  HSDPError,
  InvalidParametersError,
  ResourceAlreadyExistsError,
  ResourceNotFoundError,
  UnauthorizedError,
  ForbiddenError,
  wrapWithErrorHandling,
} from '../exceptions';
import nock, { RequestBodyMatcher } from 'nock';
import { createResourceClient } from './resources';
import { Observation } from 'fhir/r4';

const CDR_URL = 'http://localhost';
const RESOURCE_ENDPOINT = CDR_URL + '/Observation';
const ACCESS_TOKEN = 'ACCCESS_TOKEN';

const forEachStatusCode = it.each`
  statusCode | expectedException
  ${400}     | ${InvalidParametersError}
  ${401}     | ${UnauthorizedError}
  ${403}     | ${ForbiddenError}
  ${404}     | ${ResourceNotFoundError}
  ${409}     | ${ResourceAlreadyExistsError}
  ${410}     | ${ResourceNotFoundError}
  ${500}     | ${HSDPError}
`;

const OBSERVATION_WITHOUT_ID: Observation & RequestBodyMatcher = {
  id: 'something',
  resourceType: 'Observation',
  status: 'final',
  code: {
    coding: [
      {
        system: 'http://loinc.org',
        code: '15074-8',
        display: 'Glucose [Moles/volume] in Blood',
      },
    ],
  },
  valueQuantity: {
    value: 10,
  },
};

const OBSERVATION: Observation & RequestBodyMatcher & { id: string } = {
  resourceType: 'Observation',
  id: '1234',
  identifier: [
    {
      use: 'official',
      system: 'http://www.bmc.nl/zorgportal/identifiers/observations',
      value: '6325',
    },
  ],
  status: 'final',
  code: {
    coding: [
      {
        system: 'http://loinc.org',
        code: '11557-6',
        display: 'Carbon dioxide in blood',
      },
    ],
  },
  subject: {
    reference: 'Patient/f001',
    display: 'P. van de Heuvel',
  },
  effectivePeriod: {
    start: '2013-04-02T10:30:10+01:00',
    end: '2013-04-05T10:30:10+01:00',
  },
  issued: '2013-04-03T15:30:10+01:00',
  performer: [
    {
      reference: 'Practitioner/f005',
      display: 'A. Langeveld',
    },
  ],
  valueQuantity: {
    value: 6.2,
    unit: 'kPa',
    system: 'http://unitsofmeasure.org',
    code: 'kPa',
  },
};

const OBSERVATIONS = [{ ...OBSERVATION_WITHOUT_ID, id: '953' }, OBSERVATION];

const client = wrapWithErrorHandling(createResourceClient('Observation', { cdrUrl: CDR_URL }));

describe('CDR Recources', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    nock.cleanAll();
  });

  describe('create', () => {
    it('creates successfully', async () => {
      const scope = nock(RESOURCE_ENDPOINT)
        .post('', OBSERVATION_WITHOUT_ID)
        .reply(200, { ...OBSERVATION_WITHOUT_ID, id: '123' });

      const result = await client.create({
        accessToken: ACCESS_TOKEN,
        value: OBSERVATION_WITHOUT_ID,
      });

      expect(scope.isDone());
      expect(result.id).toBeTruthy();
    });

    it('ignores validate resource header by default', async () => {
      const scope = nock(RESOURCE_ENDPOINT, {
        badheaders: ['X-validate-resource'],
      })
        .post('', OBSERVATION_WITHOUT_ID)
        .reply(200, { ...OBSERVATION_WITHOUT_ID, id: '123' });

      await client.create({
        accessToken: ACCESS_TOKEN,
        value: OBSERVATION_WITHOUT_ID,
      });

      expect(scope.isDone());
    });

    it.each([true, false])('uses validate resource header when set to %b', async (b) => {
      const scope = nock(RESOURCE_ENDPOINT, {
        reqheaders: { 'X-validate-resource': b ? 'true' : 'false' },
      })
        .post('', OBSERVATION_WITHOUT_ID)
        .reply(200, { ...OBSERVATION_WITHOUT_ID, id: '123' });

      await client.create({
        accessToken: ACCESS_TOKEN,
        value: OBSERVATION_WITHOUT_ID,
        options: {
          validateResource: b,
        },
      });

      expect(scope.isDone());
    });
  });

  forEachStatusCode(
    'returns a $expectedException on status $statusCode ',
    async ({ statusCode, expectedException }) => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      jest.spyOn(console, 'error').mockImplementation(() => {});

      nock(RESOURCE_ENDPOINT)
        .post('', OBSERVATION_WITHOUT_ID)
        .reply(statusCode, 'Something went wrong');

      await expect(
        client.create({
          accessToken: ACCESS_TOKEN,
          value: OBSERVATION_WITHOUT_ID,
        }),
      ).rejects.toThrowError(expectedException);
    },
  );

  describe('update', () => {
    it('updates successfully', async () => {
      const scope = nock(RESOURCE_ENDPOINT).put('/1234').reply(200, OBSERVATION);

      await client.update({
        accessToken: ACCESS_TOKEN,
        value: OBSERVATION,
      });

      expect(scope.isDone());
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        jest.spyOn(console, 'error').mockImplementation(() => {});

        nock(RESOURCE_ENDPOINT).put('/1234').reply(statusCode, 'Something went wrong');

        await expect(
          client.update({
            accessToken: ACCESS_TOKEN,
            value: OBSERVATION,
          }),
        ).rejects.toThrowError(expectedException);
      },
    );
  });

  describe('read', () => {
    it('reads successfully', async () => {
      const scope = nock(RESOURCE_ENDPOINT).get('/1234').reply(200, OBSERVATION);

      await client.read({
        accessToken: ACCESS_TOKEN,
        id: '1234',
      });

      expect(scope.isDone());
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        jest.spyOn(console, 'error').mockImplementation(() => {});

        nock(RESOURCE_ENDPOINT).get('/1234').reply(statusCode, 'Something went wrong');

        await expect(
          client.read({
            accessToken: ACCESS_TOKEN,
            id: '1234',
          }),
        ).rejects.toThrowError(expectedException);
      },
    );
  });

  describe('delete', () => {
    it('deletes successfully', async () => {
      const scope = nock(RESOURCE_ENDPOINT).delete('/1234').reply(200, OBSERVATION);

      await client.delete({
        accessToken: ACCESS_TOKEN,
        id: '1234',
      });

      expect(scope.isDone());
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        jest.spyOn(console, 'error').mockImplementation(() => {});

        nock(RESOURCE_ENDPOINT).delete('/1234').reply(statusCode, 'Something went wrong');
        await expect(
          client.delete({
            accessToken: ACCESS_TOKEN,
            id: '1234',
          }),
        ).rejects.toThrowError(expectedException);
      },
    );
  });

  describe('search', () => {
    it('searches successfully', async () => {
      const scope = nock(RESOURCE_ENDPOINT)
        .post('/_search', {
          'managing-entity': `Organization/99`,
        })
        .reply(200, OBSERVATIONS);

      await client.search({
        accessToken: ACCESS_TOKEN,
        query: {
          'managing-entity': `Organization/99`,
        },
      });

      expect(scope.isDone());
    });

    forEachStatusCode(
      'returns a $expectedException on status $statusCode ',
      async ({ statusCode, expectedException }) => {
        nock(RESOURCE_ENDPOINT).post('/_search').reply(statusCode, 'Something went wrong');

        await expect(
          client.search({
            accessToken: ACCESS_TOKEN,
            query: {
              'managing-entity': `Organization/99`,
            },
          }),
        ).rejects.toThrowError(expectedException);
      },
    );
  });
});
