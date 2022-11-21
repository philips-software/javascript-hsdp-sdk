# CDR

## Supported FHIR resources

- [ ] FHIR STU3
- [x] FHIR R4 (See `SUPPORTED_R4_RESOURCE_TYPES` in [src/cdr/resource-types.ts](/src/cdr/resource-types.ts))

## Creating a CDR client

The following example shows how to use the CDR client.

```typescript
import { createCdrR4Client } from '<package-name>';

const cdrClient = createCdrR4Client({
  cdrUrl: 'https://some-cdr.eu-west.philips-healthsuite.com/store/fhir/some-tenant',
});

const patients = await cdrClient.patients.search({ accessToken, query: {} });
console.log(patients);
```

The `createCdrR4Client` will return a fully typed object, that has `create`, `update`, `read`, `search` and `delete` functions for each supported resource type.

For the patients and organization resource there are added functions like `purge` and `onboard`.

## Bundles

The client also has support for creating bundled resources via the `create` function directly on the client object.

```typescript

const bundle: fhir4.Bundle = {
    type: 'transaction',
    resourceType: 'Bundle',
    entry: [
      {
        fullUrl: `Patient/my_patient`,
        resource: {
          ...
        },
        request: {
          method: 'POST',
          url: `Patient/my_patient`,
        },
      },
      {
        fullUrl: `Observation/some-id`,
        resource: {
          ...,
          subject: {
            reference: `Patient/my_patient`,
          }
        }
      }
    ]
}

await cdrClient.create({ accessToken, bundle });
```

## Including other resources in searches

FHIR and CDR give you to option to include resources in searches and get them back in the response. This is also possible using the SDK.

```typescript
const observationsWithPatientsSearchResponse = await cdrClient.observations.search({
  accessToken,
  includes: {
    subject: 'Patient',
  },
  query: {
    ...
  },
});
```

This will give back FHIR Bundle with either `Patient` or `Observation` resources.

To help with extracting the correct resources there is a utility function `extractResources`, which will return an array of the selected resources to help parse the response.

```typescript
const patients = extractResources(observationsWithPatientsSearchResponse, 'Patient');
const observations = extractResources(observationsWithPatientsSearchResponse, 'Observation');
```
