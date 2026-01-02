import { RETRY_CONFIG } from '@/lib/ecfr/constants';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retries an async function with exponential backoff
 * @param fn The async function to retry
 * @param options Retry configuration options
 * @returns The result of the function call
 * @throws The last error if all attempts fail
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = RETRY_CONFIG.maxAttempts,
    initialDelay = RETRY_CONFIG.initialDelay,
    maxDelay = RETRY_CONFIG.maxDelay,
    factor = RETRY_CONFIG.factor,
    onRetry,
  } = options;

  let lastError: Error | undefined;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        // Last attempt failed, throw the error
        throw lastError;
      }

      // Call the retry callback if provided
      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Wait before retrying with exponential backoff
      await sleep(Math.min(delay, maxDelay));
      delay *= factor;
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Retry failed with unknown error');
}

/**
 * Sleep for a given number of milliseconds
 * @param ms Milliseconds to sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper to determine if an error is retryable
 * @param error The error to check
 * @returns true if the error should be retried
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  // Retry on network errors
  if (
    error.message.includes('fetch failed') ||
    error.message.includes('ECONNREFUSED') ||
    error.message.includes('ETIMEDOUT') ||
    error.message.includes('ENOTFOUND')
  ) {
    return true;
  }

  // Retry on rate limit (429) or server errors (5xx)
  if ('status' in error) {
    const status = (error as { status: number }).status;
    return status === 429 || (status >= 500 && status < 600);
  }

  return false;
}
