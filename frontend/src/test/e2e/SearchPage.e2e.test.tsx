import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import SearchPage from '../../pages/SearchPage'
import { createMockQueryResult, createSuccessQueryResult, createLoadingQueryResult } from '../utils/tanstackQueryMocks'
import type { VideoDetails } from '../../types/youtube'

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

// Mock video data for testing
const mockVideoData: VideoDetails[] = [
  {
    id: 'video1',
    title: 'Test Video 1',
    thumbnail: 'https://img.youtube.com/vi/video1/hqdefault.jpg',
    duration: '4:20',
  },
  {
    id: 'video2', 
    title: 'Test Video 2',
    thumbnail: 'https://img.youtube.com/vi/video2/hqdefault.jpg',
    duration: '3:15',
  },
  {
    id: 'video3',
    title: 'Test Video 3',
    thumbnail: 'https://img.youtube.com/vi/video3/hqdefault.jpg',
    duration: '5:30',
  }
]

const renderSearchPageWithQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <SearchPage />
    </QueryClientProvider>
  )
}

describe('SearchPage E2E Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset document title
    document.title = 'Tiramisu'
    
    // Reset location
    window.location.search = ''
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Complete Search Flow: Input to Card Display', () => {
    it('should complete the full user journey from search input to video card display', async () => {
      const user = userEvent.setup()
      
      // Start with no search results
      mockUseYouTubeSearch.mockReturnValue(createMockQueryResult<VideoDetails[]>())
      
      renderSearchPageWithQueryClient()

      // Verify initial state
      expect(screen.getByPlaceholderText('YouTube動画を検索...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /検索実行/i })).toBeInTheDocument()
      expect(screen.getByText('上の検索ボックスでYouTube動画を検索してください')).toBeInTheDocument()

      // User types in search input
      const searchInput = screen.getByPlaceholderText('YouTube動画を検索...')
      await user.type(searchInput, 'React testing')
      expect(searchInput).toHaveValue('React testing')

      // Mock successful search results
      mockUseYouTubeSearch.mockReturnValue(createSuccessQueryResult(mockVideoData))
      
      // User clicks search button
      const searchButton = screen.getByRole('button', { name: /検索実行/i })
      await user.click(searchButton)

      // Verify search results are displayed
      await waitFor(() => {
        expect(screen.getByText('Test Video 1')).toBeInTheDocument()
      })
      
      expect(screen.getByText('Test Video 2')).toBeInTheDocument()
      expect(screen.getByText('Test Video 3')).toBeInTheDocument()

      // Verify video durations (displayed on video cards)
      expect(screen.getByText('4:20')).toBeInTheDocument()
      expect(screen.getByText('3:15')).toBeInTheDocument()
      expect(screen.getByText('5:30')).toBeInTheDocument()

      // Verify thumbnails
      const thumbnailImages = screen.getAllByRole('img')
      expect(thumbnailImages).toHaveLength(3)
      expect(thumbnailImages[0]).toHaveAttribute('src', 'https://img.youtube.com/vi/video1/hqdefault.jpg')
      expect(thumbnailImages[1]).toHaveAttribute('src', 'https://img.youtube.com/vi/video2/hqdefault.jpg')
      expect(thumbnailImages[2]).toHaveAttribute('src', 'https://img.youtube.com/vi/video3/hqdefault.jpg')
    })

    it('should display loading state during search', async () => {
      // Mock loading state
      mockUseYouTubeSearch.mockReturnValue(createLoadingQueryResult<VideoDetails[]>() as any)
      
      // Set initial query to trigger loading state
      window.location.search = '?q=test'
      
      renderSearchPageWithQueryClient()

      // Verify loading state is displayed
      expect(screen.getByText('「test」を検索中...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /検索実行/ })).toBeDisabled()
      
      // Check for skeleton cards
      const skeletonCards = screen.getAllByRole('generic').filter(el => 
        el.classList.contains('animate-pulse')
      )
      expect(skeletonCards).toHaveLength(6)
    })

    it('should handle search via Enter key press', async () => {
      const user = userEvent.setup()
      
      // Start with no results
      mockUseYouTubeSearch.mockReturnValue(createMockQueryResult<VideoDetails[]>())
      
      renderSearchPageWithQueryClient()

      const searchInput = screen.getByPlaceholderText('YouTube動画を検索...')
      
      // Type search query
      await user.type(searchInput, 'Next.js tutorial')
      
      // Mock successful results before pressing Enter
      mockUseYouTubeSearch.mockReturnValue(createSuccessQueryResult(mockVideoData))
      
      // Press Enter to trigger search
      await user.keyboard('{Enter}')

      // Verify search was triggered and results displayed
      await waitFor(() => {
        expect(screen.getByText('Test Video 1')).toBeInTheDocument()
      }, { timeout: 5000 })
    })

    it('should handle URL synchronization on initial load', async () => {
      // Mock location with search query
      window.location.search = '?q=TypeScript'
      
      mockUseYouTubeSearch.mockReturnValue(createSuccessQueryResult(mockVideoData))

      renderSearchPageWithQueryClient()

      // Verify search input is populated from URL
      const searchInput = screen.getByPlaceholderText('YouTube動画を検索...')
      expect(searchInput).toHaveValue('TypeScript')

      // Verify results are displayed automatically
      await waitFor(() => {
        expect(screen.getByText('Test Video 1')).toBeInTheDocument()
      })
    })

    it('should handle video card interactions', async () => {
      const user = userEvent.setup()
      
      // Mock window.open to test video card click behavior
      const mockWindowOpen = vi.fn()
      Object.defineProperty(window, 'open', {
        value: mockWindowOpen,
        writable: true,
      })

      mockUseYouTubeSearch.mockReturnValue(createSuccessQueryResult(mockVideoData))
      
      // Set up with search results
      window.location.search = '?q=JavaScript'

      renderSearchPageWithQueryClient()

      // Wait for results to load
      await waitFor(() => {
        expect(screen.getByText('Test Video 1')).toBeInTheDocument()
      })

      // Click on first video card
      const videoCard = screen.getByText('Test Video 1').closest('div[role="button"]')
      expect(videoCard).toBeInTheDocument()
      
      await user.click(videoCard!)

      // Verify window.open was called with correct URL
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://www.youtube.com/watch?v=video1',
        '_blank',
        'noopener,noreferrer'
      )
    })

    it('should handle empty search results', async () => {
      // Mock empty response
      mockUseYouTubeSearch.mockReturnValue(createSuccessQueryResult<VideoDetails[]>([]))
      
      // Set up with search query that returns no results
      window.location.search = '?q=nonexistent%20query'
      
      renderSearchPageWithQueryClient()

      // Wait for empty state
      await waitFor(() => {
        expect(screen.getByText('「nonexistent query」に関する動画が見つかりませんでした。')).toBeInTheDocument()
      })

      // Verify suggestion message is displayed
      expect(screen.getByText('他のキーワードで検索してみてください。')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /別のキーワードで検索/i })).toBeInTheDocument()
    })

    it('should update URL when performing search', async () => {
      const user = userEvent.setup()
      
      mockUseYouTubeSearch.mockReturnValue(createMockQueryResult<VideoDetails[]>())

      renderSearchPageWithQueryClient()

      const input = screen.getByPlaceholderText('YouTube動画を検索...')
      const searchButton = screen.getByRole('button', { name: /検索実行/ })

      await user.type(input, 'test query')
      await user.click(searchButton)

      await waitFor(() => {
        expect(mockReplaceState).toHaveBeenLastCalledWith({}, '', '/?q=test+query')
      })
    })

    it('should update document title based on search query', async () => {
      const user = userEvent.setup()
      
      mockUseYouTubeSearch.mockReturnValue(createMockQueryResult<VideoDetails[]>())

      renderSearchPageWithQueryClient()

      const input = screen.getByPlaceholderText('YouTube動画を検索...')
      
      await user.type(input, 'React hooks')
      
      await waitFor(() => {
        expect(document.title).toBe('"React hooks" - Tiramisu Search')
      })
    })
  })
})