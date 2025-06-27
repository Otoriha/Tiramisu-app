import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SearchPage from '../SearchPage'

// Mock the useYouTubeSearch hook
vi.mock('../../hooks/useYouTubeSearch', () => ({
  default: vi.fn()
}))

// Mock window.history methods
const mockReplaceState = vi.fn()
Object.defineProperty(window, 'history', {
  value: {
    replaceState: mockReplaceState
  },
  writable: true
})

// Mock location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/',
    search: ''
  },
  writable: true
})

const mockUseYouTubeSearch = vi.mocked(await import('../../hooks/useYouTubeSearch')).default

// Helper function to create complete mock query result
const createMockQueryResult = (overrides = {}) => ({
  data: undefined,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
  isError: false,
  isPending: false,
  isLoadingError: false,
  isRefetchError: false,
  isSuccess: false,
  isStale: false,
  isFetching: false,
  isPaused: false,
  isPlaceholderData: false,
  isFetched: false,
  isFetchedAfterMount: false,
  isRefetching: false,
  errorUpdateCount: 0,
  dataUpdatedAt: 0,
  errorUpdatedAt: 0,
  failureCount: 0,
  failureReason: null,
  fetchStatus: 'idle' as const,
  status: 'pending' as const,
  ...overrides
})

const mockVideos = [
  {
    id: '1',
    title: 'Test Video 1',
    thumbnail: 'https://example.com/thumb1.jpg',
    duration: '3:33'
  },
  {
    id: '2', 
    title: 'Test Video 2',
    thumbnail: 'https://example.com/thumb2.jpg',
    duration: '4:12'
  }
]

const renderSearchPageWithQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <SearchPage />
    </QueryClientProvider>
  )
}

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset location
    window.location.search = ''
    // Reset document title
    document.title = ''
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('renders search page with correct initial elements', () => {
    mockUseYouTubeSearch.mockReturnValue(createMockQueryResult())

    renderSearchPageWithQueryClient()

    expect(screen.getByText('Tiramisu Search')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('YouTube動画を検索...')).toBeInTheDocument()
    expect(screen.getByText('上の検索ボックスでYouTube動画を検索してください')).toBeInTheDocument()
  })

  it('initializes search query from URL parameter', () => {
    // Mock URL with query parameter
    window.location.search = '?q=test%20query'
    
    mockUseYouTubeSearch.mockReturnValue(createMockQueryResult())

    renderSearchPageWithQueryClient()

    const input = screen.getByPlaceholderText('YouTube動画を検索...') as HTMLInputElement
    expect(input.value).toBe('test query')
  })

  it('updates document title when search query changes', async () => {
    mockUseYouTubeSearch.mockReturnValue(createMockQueryResult())

    const user = userEvent.setup()
    renderSearchPageWithQueryClient()

    const input = screen.getByPlaceholderText('YouTube動画を検索...')
    
    await user.type(input, 'test search')
    
    await waitFor(() => {
      expect(document.title).toBe('"test search" - Tiramisu Search')
    })
  })

  it('displays skeleton loading state during search', () => {
    mockUseYouTubeSearch.mockReturnValue(createMockQueryResult({ isLoading: true }))

    // Set up initial search query
    window.location.search = '?q=test'

    renderSearchPageWithQueryClient()

    expect(screen.getByText('「test」を検索中...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /検索実行/ })).toBeDisabled()
    
    // Check for skeleton cards (6 of them)
    const skeletonCards = screen.getAllByRole('generic').filter(el => 
      el.classList.contains('animate-pulse')
    )
    expect(skeletonCards).toHaveLength(6)
  })

  it('displays error state with retry button when search fails', async () => {
    const error = new Error('Search failed')
    const mockRefetch = vi.fn()
    mockUseYouTubeSearch.mockReturnValue(createMockQueryResult({ error, refetch: mockRefetch, isError: true }))

    const user = userEvent.setup()
    renderSearchPageWithQueryClient()

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
    expect(screen.getByText('Search failed')).toBeInTheDocument()
    
    const retryButton = screen.getByRole('button', { name: '再試行' })
    expect(retryButton).toBeInTheDocument()
    
    await user.click(retryButton)
    expect(mockRefetch).toHaveBeenCalledTimes(1)
  })

  it('displays search results when videos are found', () => {
    mockUseYouTubeSearch.mockReturnValue(createMockQueryResult({ data: mockVideos, isSuccess: true }))

    // Set up initial search query
    window.location.search = '?q=test'

    renderSearchPageWithQueryClient()

    expect(screen.getByText('「test」の検索結果 (2件)')).toBeInTheDocument()
    expect(screen.getByText('Test Video 1')).toBeInTheDocument()
    expect(screen.getByText('Test Video 2')).toBeInTheDocument()
  })

  it('displays enhanced empty state with re-search button when no results found', async () => {
    mockUseYouTubeSearch.mockReturnValue(createMockQueryResult({ data: [], isSuccess: true }))

    // Set up initial search query
    window.location.search = '?q=no%20results'

    const user = userEvent.setup()
    renderSearchPageWithQueryClient()

    expect(screen.getByText('「no results」に関する動画が見つかりませんでした。')).toBeInTheDocument()
    expect(screen.getByText('他のキーワードで検索してみてください。')).toBeInTheDocument()
    
    const reSearchButton = screen.getByRole('button', { name: '別のキーワードで検索' })
    expect(reSearchButton).toBeInTheDocument()
    
    // Mock the search input
    const searchInput = screen.getByPlaceholderText('YouTube動画を検索...') as HTMLInputElement
    
    await user.click(reSearchButton)
    
    // Should clear the search
    expect(searchInput).toHaveValue('')
    // Focus functionality is tested indirectly through user interaction
  })

  it('updates URL when performing search', async () => {
    mockUseYouTubeSearch.mockReturnValue(createMockQueryResult())

    const user = userEvent.setup()
    renderSearchPageWithQueryClient()

    const input = screen.getByPlaceholderText('YouTube動画を検索...')
    const searchButton = screen.getByRole('button', { name: /検索実行/ })

    await user.type(input, 'test query')
    await user.click(searchButton)

    await waitFor(() => {
      expect(mockReplaceState).toHaveBeenLastCalledWith({}, '', '/?q=test+query')
    })
  })

  it('clears URL parameter when search query is empty', async () => {
    // Start with a search query
    window.location.search = '?q=initial'
    
    mockUseYouTubeSearch.mockReturnValue(createMockQueryResult())

    const user = userEvent.setup()
    renderSearchPageWithQueryClient()

    const input = screen.getByPlaceholderText('YouTube動画を検索...')
    
    // Clear the input
    await user.clear(input)

    await waitFor(() => {
      expect(mockReplaceState).toHaveBeenCalledWith({}, '', '/')
    })
  })

  it('sets default document title when no search query', () => {
    mockUseYouTubeSearch.mockReturnValue(createMockQueryResult())

    renderSearchPageWithQueryClient()

    expect(document.title).toBe('Tiramisu Search')
  })
})