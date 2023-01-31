import {
  AndFilters,
  FindOrganizationByIdFilter,
  FindOrganizationByNameFilter,
  FindOrganizationByParentIdFilter,
  FindUserByLoginIdFilter,
  FindUserByOrganizationIdFilter,
} from './filters';

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

describe('Search User filters', () => {
  it('can filter by loginId', () => {
    const filter = FindUserByLoginIdFilter('some-id');
    expect(filter).toEqual('userName eq "some-id"');
  });

  it('can filter by organization id', () => {
    const filter = FindUserByOrganizationIdFilter('some-id');
    expect(filter).toEqual('organization.value eq "some-id"');
  });
});

describe('Shared filters', () => {
  it('can combine filters', () => {
    const filter = AndFilters([
      FindOrganizationByNameFilter('some-id'),
      FindUserByLoginIdFilter('some-id'),
    ]);
    expect(filter).toEqual('(name eq "some-id") and (userName eq "some-id")');
  });

  it('can combine single filter', () => {
    const filter = AndFilters([FindOrganizationByNameFilter('some-id')]);
    expect(filter).toEqual('(name eq "some-id")');
  });
});
