import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import SearchPage from '../../pages/SearchPage'
import { createMockQueryResult, createErrorQueryResult } from '../utils/tanstackQueryMocks'
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

// Mock console.error to avoid noise in test output
const originalConsoleError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalConsoleError
})

const mockUseYouTubeSearch = vi.mocked(await import('../../hooks/useYouTubeSearch')).default

const renderSearchPageWithQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for error testing
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

describe('SearchPage Error Handling Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.title = 'Tiramisu'
    window.location.search = ''
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('API Error Scenarios', () => {
    it('should display error UI when API request fails', async () => {
      // Mock API failure
      const error = new Error('API request failed')
      const mockRefetch = vi.fn()
      mockUseYouTubeSearch.mockReturnValue(createErrorQueryResult<VideoDetails[]>(error, { refetch: mockRefetch }))
      
      // Set up with search query to trigger error state
      window.location.search = '?q=test%20query'
      
      renderSearchPageWithQueryClient()

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
      })

      // Verify error message and retry button are displayed
      expect(screen.getByText('API request failed')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /再試行/i })).toBeInTheDocument()

      // Verify no loading state is visible
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument()
      
      // Verify no video cards are displayed
      expect(screen.queryByText('Test Video')).not.toBeInTheDocument()
    })

    it('should handle network connectivity errors', async () => {
      // Mock network error
      const error = new Error('Network Error: Failed to fetch')
      mockUseYouTubeSearch.mockReturnValue(createErrorQueryResult<VideoDetails[]>(error))
      
      // Set up with search query
      window.location.search = '?q=network%20test'
      
      renderSearchPageWithQueryClient()

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
      })

      // Verify error UI is displayed
      expect(screen.getByText('Network Error: Failed to fetch')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /再試行/i })).toBeInTheDocument()
    })

    it('should allow retry after error', async () => {
      const user = userEvent.setup()
      
      // Start with error state
      const error = new Error('Initial API failure')
      const mockRefetch = vi.fn()
      mockUseYouTubeSearch.mockReturnValue(createErrorQueryResult<VideoDetails[]>(error, { refetch: mockRefetch }))
      
      // Set up with search query
      window.location.search = '?q=retry%20test'
      
      renderSearchPageWithQueryClient()

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
      })

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /再試行/i })
      await user.click(retryButton)

      // Verify refetch was called
      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })

    it('should maintain search input state during error', async () => {
      // Mock API failure
      const error = new Error('API failure')
      mockUseYouTubeSearch.mockReturnValue(createErrorQueryResult<VideoDetails[]>(error))
      
      // Set up with search query
      window.location.search = '?q=state%20test'
      
      renderSearchPageWithQueryClient()

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
      })

      // Verify search input still contains the query
      const searchInput = screen.getByPlaceholderText('YouTube動画を検索...')
      expect(searchInput).toHaveValue('state test')
    })

    it('should handle focus management during error states', async () => {
      const user = userEvent.setup()
      
      // Mock API failure
      const error = new Error('Focus test error')
      mockUseYouTubeSearch.mockReturnValue(createErrorQueryResult<VideoDetails[]>(error))
      
      // Set up with search query
      window.location.search = '?q=focus%20test'
      
      renderSearchPageWithQueryClient()

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
      })

      // Verify retry button is focusable
      const retryButton = screen.getByRole('button', { name: /再試行/i })
      expect(retryButton).toBeInTheDocument()
      expect(retryButton).not.toBeDisabled()

      // Verify search input is still focusable
      const searchInput = screen.getByPlaceholderText('YouTube動画を検索...')
      expect(searchInput).not.toBeDisabled()
      await user.click(searchInput)
      expect(searchInput).toHaveFocus()
    })
  })
})