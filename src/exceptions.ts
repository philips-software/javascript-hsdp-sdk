import { AxiosError } from 'axios';
import { AsyncFunction } from './types';

export class ResourceAlreadyExistsError extends Error {}
export class ResourceNotFoundError extends Error {}
export class InvalidParametersError extends Error {}
export class HSDPError extends Error {}
export class UnauthorizedError extends Error {}
export class ForbiddenError extends Error {}

export const handleError = (e: unknown): never => {
  if (e instanceof AxiosError && e.response) {
    switch (e.response.status) {
      case 400:
        throw new InvalidParametersError();
      case 401:
        throw new UnauthorizedError();
      case 403:
        throw new ForbiddenError();
      case 404:
        throw new ResourceNotFoundError();
      case 409:
        throw new ResourceAlreadyExistsError();
      case 410:
        throw new ResourceNotFoundError();
      default:
        throw new HSDPError(`Unknown error has occured during the request: ${e.message}`);
    }
  } else if (e instanceof Error) {
    throw new HSDPError(`Unknown error has occured: ${e.message}`);
  }
  throw new HSDPError(`Unknown error has occured: ${e}`);
};

/**
 * Wraps each API client function with error handling by returning a higher order function
 * @returns A new copy of the API client where each function has been wrapped with error handling
 */
export function wrapWithErrorHandling<T extends Record<string, AsyncFunction>>(clientModule: T) {
  return Object.entries(clientModule).reduce((wrappedFns, [name, clientFn]) => {
    // Create new function that calls the wrapped API client function with its original arguments
    const wrappedClientFn = async (...args: unknown[]) => {
      try {
        return await clientFn(...args);
      } catch (e) {
        if (e instanceof AxiosError && e.response) {
          console.error(`${e.response.status}: ${JSON.stringify(e.response.data)}`);
        } else {
          console.error(e);
        }
        throw handleError(e);
      }
    };

    // use the wrapped version instead of the original
    wrappedFns[name] = wrappedClientFn;
    return wrappedFns;
  }, {} as Record<string, AsyncFunction>) as T;
}
