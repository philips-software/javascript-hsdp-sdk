# Utilities

## `retryAsync`

This utility function can be called on all IDM and CDR functions and will retry a Promise until it either succeeds or reaches the maximum number of retries.

### Options

| name               | description                                                                                                                                                                              | default                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `backoffStrategy`  | Set the retry strategy. Either `BackoffStrategy.Static` for always waiting `delayMs` or `BackoffStrategy.Exponential` for exponentially waiting `delayMs`.                               | `BackoffStrategy.Static` |
| `retryCount`       | Number of retries to do until a failure is returned.                                                                                                                                     | 2                        |
| `delayMs`          | The time to (exponentially) wait between each retry in milliseconds.                                                                                                                     | 500                      |
| `alsoRetryOnError` | Will also retry if this specifc type of error occures. Handy in cases where for instance the CDR returns a `ForbiddenError` while trying to onboard a recently created IAM organization. | N/A                      |

### Example:

```typescript
const role = await retryAsync(() =>
  idmClient.roles.createRole({
    accessToken,
    managingOrganization: organizationId,
    name: groupName,
  }),
);
```
