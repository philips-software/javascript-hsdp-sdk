import {
  FindOrganizationByIdFilter,
  FindOrganizationByNameFilter,
  FindOrganizationByParentIdFilter,
} from './organization-filters';

describe('Search Organization filters', () => {
  it('can filter by parent id', () => {
    const filter = FindOrganizationByParentIdFilter('some-id');
    expect(filter).toEqual('parent.value eq "some-id"');
  });

  it('can filter by id', () => {
    const filter = FindOrganizationByIdFilter('some-id');
    expect(filter).toEqual('id eq "some-id"');
  });

  it('can filter by name', () => {
    const filter = FindOrganizationByNameFilter('some-id');
    expect(filter).toEqual('name eq "some-id"');
  });
});
