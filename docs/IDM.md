# IDM

## Implemented calls

_Feel free to help implement more!_

- [ ] Application
- [ ] Client
- [ ] Device
- [x] Group
- [x] Organization
- [ ] Proposition
- [x] Role and Permission
- [ ] Service
- [ ] User
- [ ] SCIM User
- [ ] Email Template
- [ ] Password Policy
- [ ] SMS Gateway
- [ ] SMS Template
- [ ] ScopePermissionMap
- [ ] SAML Configuration
- [ ] Legacy paths
  - [x] GET /security/users

## Creating a IDM client

The following example shows how to use the IDM client.

```typescript
import { createIdmClient } from '<package-name>';

const idmClient = createIdmClient({
  idmUrl: 'https://idm-service.eu-west.philips-healthsuite.com',
});

const organization = await idmClient.organizations.createOrganization({
  accessToken,
  name: 'My-New-Organization',
  displayName: 'My new organization',
  description: 'Description for my new organization',
  parentId: '<my-parent-org-id>',
});

console.log(organization.id);
```

The `createIdmClient` call returns a fully typed object that can be used to interact with the HSDP IDM API.
