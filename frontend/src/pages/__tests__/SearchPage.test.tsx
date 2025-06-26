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
    mockUseYouTubeSearch.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null
    })

    renderSearchPageWithQueryClient()

    expect(screen.getByText('Tiramisu Search')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('YouTube動画を検索...')).toBeInTheDocument()
    expect(screen.getByText('上の検索ボックスでYouTube動画を検索してください')).toBeInTheDocument()
  })

  it('initializes search query from URL parameter', () => {
    // Mock URL with query parameter
    window.location.search = '?q=test%20query'
    
    mockUseYouTubeSearch.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null
    })

    renderSearchPageWithQueryClient()

    const input = screen.getByPlaceholderText('YouTube動画を検索...') as HTMLInputElement
    expect(input.value).toBe('test query')
  })

  it('updates document title when search query changes', async () => {
    mockUseYouTubeSearch.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null
    })

    const user = userEvent.setup()
    renderSearchPageWithQueryClient()

    const input = screen.getByPlaceholderText('YouTube動画を検索...')
    
    await user.type(input, 'test search')
    
    await waitFor(() => {
      expect(document.title).toBe('"test search" - Tiramisu Search')
    })
  })

  it('displays loading state during search', () => {
    mockUseYouTubeSearch.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null
    })

    renderSearchPageWithQueryClient()

    expect(screen.getByText('検索中...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /検索実行/ })).toBeDisabled()
  })

  it('displays error message when search fails', () => {
    const error = new Error('Search failed')
    mockUseYouTubeSearch.mockReturnValue({
      data: undefined,
      isLoading: false,
      error
    })

    renderSearchPageWithQueryClient()

    expect(screen.getByText('エラーが発生しました: Search failed')).toBeInTheDocument()
  })

  it('displays search results when videos are found', () => {
    mockUseYouTubeSearch.mockReturnValue({
      data: mockVideos,
      isLoading: false,
      error: null
    })

    // Set up initial search query
    window.location.search = '?q=test'

    renderSearchPageWithQueryClient()

    expect(screen.getByText('「test」の検索結果 (2件)')).toBeInTheDocument()
    expect(screen.getByText('Test Video 1')).toBeInTheDocument()
    expect(screen.getByText('Test Video 2')).toBeInTheDocument()
  })

  it('displays no results message when search returns empty array', () => {
    mockUseYouTubeSearch.mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    })

    // Set up initial search query
    window.location.search = '?q=no%20results'

    renderSearchPageWithQueryClient()

    expect(screen.getByText('「no results」に関する動画が見つかりませんでした。')).toBeInTheDocument()
  })

  it('updates URL when performing search', async () => {
    mockUseYouTubeSearch.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null
    })

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
    
    mockUseYouTubeSearch.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null
    })

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
    mockUseYouTubeSearch.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null
    })

    renderSearchPageWithQueryClient()

    expect(document.title).toBe('Tiramisu Search')
  })
})