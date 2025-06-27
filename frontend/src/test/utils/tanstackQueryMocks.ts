import { UseQueryResult } from '@tanstack/react-query';

export function createMockQueryResult<TData = unknown, TError = Error>(
  overrides: Partial<UseQueryResult<TData, TError>> = {}
): UseQueryResult<TData, TError> {
  const defaultResult: UseQueryResult<TData, TError> = {
    data: undefined,
    error: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    isLoadingError: false,
    isRefetchError: false,
    isInitialLoading: false,
    isPending: true,
    isPlaceholderData: false,
    isPreviousData: false,
    isStale: true,
    isFetched: false,
    isFetchedAfterMount: false,
    isFetching: false,
    isRefetching: false,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    status: 'pending',
    fetchStatus: 'idle',
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    promise: Promise.resolve(undefined as TData),
    refetch: jest.fn(() => Promise.resolve({} as UseQueryResult<TData, TError>)),
    remove: jest.fn(),
  };

  return { ...defaultResult, ...overrides };
}

export function createSuccessQueryResult<TData = unknown>(
  data: TData,
  overrides: Partial<UseQueryResult<TData, Error>> = {}
): UseQueryResult<TData, Error> {
  return createMockQueryResult<TData>({
    data,
    isSuccess: true,
    isError: false,
    isPending: false,
    isLoading: false,
    isInitialLoading: false,
    status: 'success',
    isFetched: true,
    promise: Promise.resolve(data),
    ...overrides,
  });
}

export function createErrorQueryResult<TData = unknown>(
  error: Error,
  overrides: Partial<UseQueryResult<TData, Error>> = {}
): UseQueryResult<TData, Error> {
  return createMockQueryResult<TData>({
    error,
    isError: true,
    isSuccess: false,
    isPending: false,
    isLoading: false,
    isInitialLoading: false,
    isLoadingError: true,
    status: 'error',
    failureCount: 1,
    failureReason: error,
    errorUpdateCount: 1,
    promise: Promise.reject(error),
    ...overrides,
  });
}

export function createLoadingQueryResult<TData = unknown>(
  overrides: Partial<UseQueryResult<TData, Error>> = {}
): UseQueryResult<TData, Error> {
  return createMockQueryResult<TData>({
    isLoading: true,
    isInitialLoading: true,
    isPending: true,
    isError: false,
    isSuccess: false,
    status: 'pending',
    fetchStatus: 'fetching',
    isFetching: true,
    ...overrides,
  });
}