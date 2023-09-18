import axios from 'axios';
import { AuthParams, ClientOptions, ParamOptions, getHeadersFromOptions } from './common';

type BatchParams = AuthParams & {
  bundle: fhir4.Bundle;
  options: ParamOptions;
};

export function createBatchClient(options: ClientOptions) {
  const axiosInstance = axios.create({ baseURL: options.cdrUrl + '/' });

  return {
    async create(params: BatchParams) {
      const response = await axiosInstance.post(`/`, params.bundle, {
        headers: {
          ...getHeadersFromOptions(params.options),
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
