import type { UseQueryResult } from '@tanstack/react-query';

export function createMockQueryResult<TData = unknown, TError = Error>(
  data?: TData,
  error?: TError,
  isLoading = false
): UseQueryResult<TData, TError> {
  const baseResult = {
    data: data as TData,
    error: error as TError,
    isError: !!error,
    isSuccess: !error && data !== undefined,
    isLoading,
    isPending: isLoading,
    isFetched: !isLoading,
    isFetching: isLoading,
    status: error ? 'error' as const : !isLoading ? 'success' as const : 'pending' as const,
    fetchStatus: isLoading ? 'fetching' as const : 'idle' as const,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    dataUpdatedAt: Date.now(),
    errorUpdatedAt: error ? Date.now() : 0,
    isLoadingError: false,
    isRefetchError: false,
    isPlaceholderData: false,
    isStale: false,
    isFetchedAfterMount: true,
    isRefetching: false,
  };

  return {
    ...baseResult,
    refetch: vi.fn(),
    remove: vi.fn(),
    promise: Promise.resolve(data as TData),
  } as UseQueryResult<TData, TError>;
}

export function createSuccessQueryResult<TData = unknown>(
  data: TData
): UseQueryResult<TData, Error> {
  return createMockQueryResult(data, undefined, false);
}

export function createLoadingQueryResult<TData = unknown>(): UseQueryResult<TData, Error> {
  return createMockQueryResult(undefined, undefined, true);
}

export function createErrorQueryResult<TError = Error>(
  error: TError
): UseQueryResult<unknown, TError> {
  return createMockQueryResult(undefined, error, false);
}