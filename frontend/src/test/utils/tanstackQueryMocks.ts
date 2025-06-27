import type { UseQueryResult } from '@tanstack/react-query';

// Simplified mock utility for testing
export function createMockQueryResult<TData = unknown, TError = Error>(
  overrides: Partial<UseQueryResult<TData, TError>> = {}
): UseQueryResult<TData, TError> {
  const baseResult = {
    data: undefined as TData,
    error: null as TError | null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    isPending: false,
    isFetched: false,
    isFetching: false,
    status: 'pending' as const,
    fetchStatus: 'idle' as const,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    dataUpdatedAt: Date.now(),
    errorUpdatedAt: 0,
    isLoadingError: false,
    isRefetchError: false,
    isPlaceholderData: false,
    isStale: false,
    isFetchedAfterMount: false,
    isRefetching: false,
    isInitialLoading: false,
    isPaused: false,
    refetch: vi.fn(),
    remove: vi.fn(),
    promise: Promise.resolve(undefined as TData),
  };

  return {
    ...baseResult,
    ...overrides,
  } as UseQueryResult<TData, TError>;
}

export function createSuccessQueryResult<TData = unknown>(
  data: TData
): UseQueryResult<TData, Error> {
  return createMockQueryResult<TData, Error>({
    data,
    error: null,
    isError: false,
    isSuccess: true,
    isLoading: false,
    isPending: false,
    isFetched: true,
    status: 'success',
  });
}

export function createLoadingQueryResult<TData = unknown>(): UseQueryResult<TData | undefined, Error> {
  return createMockQueryResult<TData | undefined, Error>({
    data: undefined,
    error: null,
    isError: false,
    isSuccess: false,
    isLoading: true,
    isPending: true,
    isFetched: false,
    status: 'pending',
  });
}

export function createErrorQueryResult<TError = Error>(
  error: TError
): UseQueryResult<undefined, TError> {
  return createMockQueryResult<undefined, TError>({
    data: undefined,
    error,
    isError: true,
    isSuccess: false,
    isLoading: false,
    isPending: false,
    isFetched: true,
    status: 'error',
  });
}