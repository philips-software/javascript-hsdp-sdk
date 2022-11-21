import axios from 'axios';
import { AuthParams, ClientOptions } from './common';
import { createResourceClient } from './resources';

type PurgePatientParams = AuthParams & {
  patientId: string;
};

export function createPatientsClient(options: ClientOptions) {
  return {
    ...createResourceClient('Patient', options),
    async purge(params: PurgePatientParams) {
      await axios.post(
        `${options.cdrUrl}/Patient/${params.patientId}/$purge`,
        {},
        {
          headers: {
            Authorization: `Bearer ${params.accessToken}`,
            'API-Version': 1,
            Accept: 'application/fhir+json;fhirVersion=4.0',
            'Content-Type': 'application/fhir+json;fhirVersion=4.0',
          },
        },
      );
    },
  };
}
