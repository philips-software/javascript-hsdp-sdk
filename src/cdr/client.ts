import { wrapWithErrorHandling } from '../exceptions';
import { createBatchClient } from './batch';
import { ClientOptions } from './common';
import { createOrganizationsClient } from './organizations';
import { createPatientsClient } from './patients';
import { R4ResourceType, SUPPORTED_R4_RESOURCE_TYPES } from './resource-types';
import { createResourceClient } from './resources';

function uncapitalize(s: string) {
  return s[0].toLowerCase() + s.slice(1);
}

type CdrR4ClientResources = {
  [Type in R4ResourceType as `${Uncapitalize<string & Type>}s`]: ReturnType<
    typeof createResourceClient<Type>
  >;
};

export type CdrR4Client = Omit<CdrR4ClientResources, 'organizations' | 'patients'> &
  ReturnType<typeof createBatchClient> & {
    organizations: ReturnType<typeof createOrganizationsClient>;
    patients: ReturnType<typeof createPatientsClient>;
  };

export function createCdrR4Client(options: ClientOptions): CdrR4Client {
  const resourceClients = SUPPORTED_R4_RESOURCE_TYPES.map((r) => ({
    [`${uncapitalize(r)}s`]: wrapWithErrorHandling(createResourceClient(r, options)),
  })).reduce((prev, curr) => ({ ...prev, ...curr }), {}) as CdrR4ClientResources;

  return {
    ...resourceClients,
    organizations: wrapWithErrorHandling(createOrganizationsClient(options)),
    patients: wrapWithErrorHandling(createPatientsClient(options)),
    ...wrapWithErrorHandling(createBatchClient(options)),
  };
}
