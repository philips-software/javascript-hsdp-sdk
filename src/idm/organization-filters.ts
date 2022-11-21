export type OrganizationFilter = string;

export const FindOrganizationByParentIdFilter: (parentId: string) => OrganizationFilter = (
  parentId: string,
) => `parent.value eq "${parentId}"`;

export const FindOrganizationByNameFilter: (name: string) => OrganizationFilter = (name: string) =>
  `name eq "${name}"`;

export const FindOrganizationByIdFilter: (id: string) => OrganizationFilter = (id: string) =>
  `id eq "${id}"`;
