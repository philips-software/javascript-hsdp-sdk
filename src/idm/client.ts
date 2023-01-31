import { wrapWithErrorHandling } from '../exceptions';
import { ClientOptions } from './common';
import { createGroupsClient } from './groups';
import { createOrganizationsClient } from './organizations';
import { createRolesClient } from './roles';
import { createSecurityClient } from './security';
import { createUsersClient } from './users';
import { createScimGroupsClient } from './scim-groups';
import { createScimUsersClient } from './scim-users';

export { IamPermission } from './iam-permissions';
export { Organization as IDMOrganization } from './organizations';
export * from './filters';

export function createIdmClient(options: ClientOptions) {
  return {
    groups: wrapWithErrorHandling(createGroupsClient(options)),
    roles: wrapWithErrorHandling(createRolesClient(options)),
    organizations: wrapWithErrorHandling(createOrganizationsClient(options)),
    security: wrapWithErrorHandling(createSecurityClient(options)),
    users: wrapWithErrorHandling(createUsersClient(options)),
    scimGroups: wrapWithErrorHandling(createScimGroupsClient(options)),
    scimUsers: wrapWithErrorHandling(createScimUsersClient(options)),
  };
}
