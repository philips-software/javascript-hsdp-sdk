import { wrapWithErrorHandling } from '../exceptions';
import { ClientOptions } from './common';
import { createGroupsClient } from './groups';
import { createOrganizationsClient } from './organizations';
import { createRolesClient } from './roles';
import { createSecurityClient } from './security';
import { createUsersClient } from './users';

export { IamPermission } from './iam-permissions';
export { Organization as IDMOrganization } from './organizations';
export * from './organization-filters';

export function createIdmClient(options: ClientOptions) {
  return {
    groups: wrapWithErrorHandling(createGroupsClient(options)),
    roles: wrapWithErrorHandling(createRolesClient(options)),
    organizations: wrapWithErrorHandling(createOrganizationsClient(options)),
    security: wrapWithErrorHandling(createSecurityClient(options)),
    users: wrapWithErrorHandling(createUsersClient(options)),
  };
}
