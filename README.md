# HSDP SDK for JavaScript

This project provides a Software Development Kit that makes interaction with HSDP APIs easy for a JavaScript programmer. Instead of having to worry about composing the correct HTTP requests (required url, headers, body, query parameters, parsing responses), the user interacts with statically typed data structures, giving autocompletion and field name discovery of the request and response data structures.

- **Technology stack**: the library is intended for use in any JavaScript project that needs to interact with HSDP APIs.
- **Status**: the software is still in early development, only supporting a few of the HSDP APIs.

## Dependencies

The SDK can be used in any JavaScript project via any package manager.

## Installation

_TODO: determine package name_

```sh
yarn add <package_name>
```

or

```sh
npm install --save <package_name>
```

## Usage

This SDK is split into multiple parts and has specific documentation for each of them in the [docs](docs) folder:

- [IAM](docs/IAM.md)
- [IDM](docs/IDM.md)
- [CDR](docs/CDR.md)
- [Utils](docs/utils.md)

## How to test the software

Use the following command to run the unit tests:

```sh
yarn test
```

## Known issues

At this moment, there are no known issues.

## Contact / Getting help

In case of questions about this SDK, please check with the issue tracker if that is a known problem or feature request.
And if that does not help, reach out to the [maintainers](MAINTAINERS.md).

## License

See [LICENSE](LICENSE)

## Credits and references

This SDK used the [Kotlin HSDP SDK](https://github.com/philips-software/kotlin-hsdp-sdk) and [HSDP SDK for Dotnet 6.0](https://github.com/philips-software/dotnet-hsdp-sdk) as inspiration.
