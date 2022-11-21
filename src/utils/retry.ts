import { HSDPError } from '../exceptions';

export enum BackoffStrategy {
  Static,
  Exponential,
}

type RetryOptions = {
  retryCount: number;
  backoffStrategy: BackoffStrategy;
  delayMs: number;
  alsoRetryOnError?: { new (): Error };
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  backoffStrategy: BackoffStrategy.Static,
  retryCount: 2,
  delayMs: 500,
};

export async function retryAsync<T>(
  fn: () => Promise<T>,
  userOptions: Partial<RetryOptions> = {},
  retries = 0,
): Promise<T> {
  const options = { ...DEFAULT_RETRY_OPTIONS, ...userOptions };
  const waitTime =
    options.backoffStrategy == BackoffStrategy.Exponential
      ? retries > 0
        ? Math.pow(2, retries - 1) * options.delayMs
        : 0
      : retries * options.delayMs;
  console.debug(`Retry ${retries}/${options.retryCount} after ${waitTime} ms...`);
  await delay(waitTime);
  return fn().catch((e) => {
    if (
      e instanceof HSDPError ||
      (options.alsoRetryOnError && e instanceof options.alsoRetryOnError)
    ) {
      if (retries < options.retryCount) {
        return retryAsync(fn, options, retries + 1);
      } else {
        throw e;
      }
    } else {
      throw e;
    }
  });
}
