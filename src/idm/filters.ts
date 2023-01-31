export type OrganizationFilter = string;
export type UserFilter = string;

type Filter = OrganizationFilter | UserFilter;

export const FindOrganizationByParentIdFilter: (parentId: string) => OrganizationFilter = (
  parentId: string,
) => `parent.value eq "${parentId}"`;

export const FindOrganizationByNameFilter: (name: string) => OrganizationFilter = (name: string) =>
  `name eq "${name}"`;

export const FindOrganizationByIdFilter: (id: string) => OrganizationFilter = (id: string) =>
  `id eq "${id}"`;

export const FindUserByOrganizationIdFilter: (id: string) => UserFilter = (id: string) =>
  `organization.value eq "${id}"`;

export const FindUserByLoginIdFilter: (id: string) => UserFilter = (id: string) =>
  `userName eq "${id}"`;

export const AndFilters: (filters: Filter[]) => string = (filters) =>
  filters.map((f) => `(${f})`).join(' and ');
