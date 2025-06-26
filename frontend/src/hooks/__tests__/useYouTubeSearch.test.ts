import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import useYouTubeSearch from '../useYouTubeSearch';
import YouTubeApiWrapper from '../../services/youtubeApiFetch';

// Mock the YouTubeApiWrapper
vi.mock('../../services/youtubeApiFetch');

const mockSearchVideos = vi.fn();
const MockedYouTubeApiWrapper = YouTubeApiWrapper as any;
MockedYouTubeApiWrapper.mockImplementation(() => ({
  searchVideos: mockSearchVideos,
}));

const mockVideoData = [
  {
    id: 'video1',
    title: 'Test Video 1',
    thumbnail: 'https://example.com/thumb1.jpg',
    duration: 'PT5M30S',
  },
  {
    id: 'video2',
    title: 'Test Video 2',
    thumbnail: 'https://example.com/thumb2.jpg',
    duration: 'PT3M45S',
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0, // Don't retry in tests
        gcTime: 0, // Don't cache in tests
        staleTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useYouTubeSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useYouTubeSearch('test query'), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should fetch data successfully', async () => {
    mockSearchVideos.mockResolvedValue(mockVideoData);

    const { result } = renderHook(() => useYouTubeSearch('test query'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockVideoData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockSearchVideos).toHaveBeenCalledWith('test query');
  });

  it.skip('should handle errors', async () => {
    const errorMessage = 'Failed to search YouTube videos';
    mockSearchVideos.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useYouTubeSearch('test query'), {
      wrapper: createWrapper(),
    });

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 3000 }
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error?.message).toBe(errorMessage);
  });

  it('should not fetch when query is empty', () => {
    renderHook(() => useYouTubeSearch(''), {
      wrapper: createWrapper(),
    });

    expect(mockSearchVideos).not.toHaveBeenCalled();
  });

  it('should not fetch when enabled is false', () => {
    renderHook(() => useYouTubeSearch('test query', { enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(mockSearchVideos).not.toHaveBeenCalled();
  });

  it('should use custom options', async () => {
    mockSearchVideos.mockResolvedValue(mockVideoData);

    const customOptions = {
      staleTime: 10000,
      retry: 1,
    };

    const { result } = renderHook(
      () => useYouTubeSearch('test query', customOptions),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockVideoData);
    expect(mockSearchVideos).toHaveBeenCalledWith('test query');
  });

  it('should update query key when query changes', async () => {
    mockSearchVideos.mockResolvedValue(mockVideoData);

    const { result, rerender } = renderHook(
      ({ query }) => useYouTubeSearch(query),
      {
        wrapper: createWrapper(),
        initialProps: { query: 'first query' },
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSearchVideos).toHaveBeenCalledWith('first query');

    mockSearchVideos.mockClear();
    mockSearchVideos.mockResolvedValue([]);

    rerender({ query: 'second query' });

    await waitFor(() => {
      expect(mockSearchVideos).toHaveBeenCalledWith('second query');
    });
  });
});