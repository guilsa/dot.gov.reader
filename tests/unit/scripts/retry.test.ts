import { describe, it, expect, vi } from 'vitest';
import { retryWithBackoff, isRetryableError } from '@/scripts/utils/retry';

describe('retryWithBackoff', () => {
  it('should return result on first successful attempt', async () => {
    const mockFn = vi.fn().mockResolvedValue('success');

    const result = await retryWithBackoff(mockFn);

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValue('success');

    const result = await retryWithBackoff(mockFn, {
      initialDelay: 10,
      maxDelay: 100,
    });

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('should throw error after max attempts', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Persistent failure'));

    await expect(
      retryWithBackoff(mockFn, {
        maxAttempts: 2,
        initialDelay: 10,
      })
    ).rejects.toThrow('Persistent failure');

    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should call onRetry callback on each retry', async () => {
    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Failure'))
      .mockResolvedValue('success');

    const onRetry = vi.fn();

    await retryWithBackoff(mockFn, {
      initialDelay: 10,
      onRetry,
    });

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
  });

  it('should implement exponential backoff', async () => {
    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Failure 1'))
      .mockRejectedValueOnce(new Error('Failure 2'))
      .mockResolvedValue('success');

    const delays: number[] = [];
    const onRetry = vi.fn((attempt: number) => {
      delays.push(attempt);
    });

    await retryWithBackoff(mockFn, {
      initialDelay: 100,
      factor: 2,
      maxDelay: 1000,
      onRetry,
    });

    expect(delays).toEqual([1, 2]);
  });
});

describe('isRetryableError', () => {
  it('should return true for network errors', () => {
    const networkError = new Error('fetch failed');
    expect(isRetryableError(networkError)).toBe(true);
  });

  it('should return true for connection errors', () => {
    const connectionError = new Error('ECONNREFUSED');
    expect(isRetryableError(connectionError)).toBe(true);
  });

  it('should return true for timeout errors', () => {
    const timeoutError = new Error('ETIMEDOUT');
    expect(isRetryableError(timeoutError)).toBe(true);
  });

  it('should return false for non-error values', () => {
    expect(isRetryableError('not an error')).toBe(false);
    expect(isRetryableError(null)).toBe(false);
    expect(isRetryableError(undefined)).toBe(false);
  });

  it('should return false for non-retryable errors', () => {
    const regularError = new Error('Some other error');
    expect(isRetryableError(regularError)).toBe(false);
  });
});
