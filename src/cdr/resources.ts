import axios from 'axios';
import { AuthParams, ClientOptions } from './common';
import { R4ResourceType, ResourceByType, R4Bundle } from './resource-types';
import fhir4, { Reference } from 'fhir/r4';

type ResourceValueParams<T> = AuthParams & {
  value: T;
};

type ResourceIdParams = AuthParams & {
  id: string;
};

type ReferenceKeys<T> = {
  [K in keyof T]: Required<T[K]> extends Required<Reference> ? K : never;
}[keyof T];

type ResourceSearchParams<T, IncludedTypes extends R4ResourceType> = AuthParams & {
  query: { [key: string]: string };
  includes?: Partial<Record<ReferenceKeys<Required<T>>, IncludedTypes>>;
};

type SearchBundle<
  T extends fhir4.FhirResource,
  IncludedTypes extends R4ResourceType,
> = R4ResourceType extends IncludedTypes
  ? R4Bundle<T>
  : R4Bundle<ResourceByType<T['resourceType'] | IncludedTypes> & { id: string }>;

export function createResourceClient<ResourceType extends R4ResourceType>(
  resource: ResourceType,
  options: ClientOptions,
) {
  type Resource = ResourceByType<ResourceType>;
  type ResourceWithId = Resource & { id: string };

  const axiosInstance = axios.create({
    baseURL: options.cdrUrl + '/',
    headers: {
      'API-Version': 1,
      Accept: 'application/fhir+json;fhirVersion=4.0',
      'Content-Type': 'application/fhir+json;fhirVersion=4.0',
    },
  });

  return {
    async create(params: ResourceValueParams<Resource>) {
      const response = await axiosInstance.post<ResourceWithId>(`/${resource}`, params.value, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      });

      return response.data;
    },

    async update(params: ResourceValueParams<ResourceWithId>) {
      const response = await axiosInstance.put<ResourceWithId>(
        `/${resource}/${params.value.id}`,
        params.value,
        {
          headers: {
            Authorization: `Bearer ${params.accessToken}`,
          },
        },
      );

      return response.data;
    },

    async read(params: ResourceIdParams) {
      const response = await axiosInstance.get<ResourceWithId>(`/${resource}/${params.id}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      });

      return response.data;
    },

    async search<IncludedResourceTypes extends R4ResourceType>(
      params: ResourceSearchParams<ResourceWithId, IncludedResourceTypes>,
    ) {
      const encodedParams = new URLSearchParams(params.query);

      if (params.includes) {
        Object.entries(params.includes).forEach(([refProp, refType]) =>
          encodedParams.append('_include', `${resource}:${refProp}:${refType}`),
        );
      }

      const response = await axiosInstance.post<
        SearchBundle<ResourceWithId, IncludedResourceTypes>
      >(`/${resource}/_search`, encodedParams.toString(), {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data;
    },

    async delete(params: ResourceIdParams) {
      await axiosInstance.delete(`/${resource}/${params.id}`, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      });
    },
  };
}
