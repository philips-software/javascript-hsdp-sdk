import axios from 'axios';
import { AuthParams, ClientOptions } from './common';

type OrganizationParams = AuthParams & {
  orgId: string;
};

type OnboardOrganizationParams = OrganizationParams & {
  name: string;
};

export function createOrganizationsClient(options: ClientOptions) {
  const axiosInstance = axios.create({ baseURL: options.cdrUrl + '/Organization' });

  return {
    async onboard(params: OnboardOrganizationParams) {
      const response = await axiosInstance.put(
        `/${params.orgId}`,
        {
          resourceType: 'Organization',
          id: params.orgId,
          name: params.name,
          identifier: [
            {
              use: 'usual',
              system: 'https://identity.philips-healthsuite.com/organization',
              value: params.orgId,
            },
          ],
          active: true,
        },
        {
          headers: {
            Authorization: `Bearer ${params.accessToken}`,
            'API-Version': 1,
            Accept: 'application/fhir+json;fhirVersion=4.0',
            'Content-Type': 'application/fhir+json;fhirVersion=4.0',
          },
        },
      );

      // TODO type the response?
      return response.data;
    },

    async delete(params: OrganizationParams) {
      await axiosInstance.delete(`/${params.orgId}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'API-Version': 1,
          Accept: 'application/fhir+json;fhirVersion=4.0',
          'Content-Type': 'application/fhir+json;fhirVersion=4.0',
        },
      });
    },

    async purge(params: OrganizationParams) {
      await axios.post(
        `${options.cdrUrl}/$purge`,
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

    async get(params: OrganizationParams) {
      const response = await axiosInstance.get(`/${params.orgId}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'API-Version': 1,
          Accept: 'application/fhir+json;fhirVersion=4.0',
          'Content-Type': 'application/fhir+json;fhirVersion=4.0',
        },
      });
      return response.data;
    },
  };
}
