# IAM

## Implemented calls

_Feel free to help implement more!_

- [ ] Federation
- [ ] OAuth2
  - [ ] Login as User
  - [x] Login as Service
  - [ ] Refresh Access Token
  - [ ] Introspect
  - [ ] Logout
- [ ] Token

## Usage

### Login as Service

Implements OAuth2 login with a service account (`jwt-bearer` flow).

#### Example

```typescript
import { loginWithUserAccount } from '<package-name>';

const { access_token: accessToken } = await loginWithUserAccount(
  'https://iam-service.eu-west.philips-healthsuite.com',
  'my-service-account.my-org@my-org.philips-healthsuite.com',
  '<private-key>',
);
```
