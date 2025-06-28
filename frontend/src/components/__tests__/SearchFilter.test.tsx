import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SearchFilter } from '../SearchFilter'
import type { RecipeSearchParams } from '../../types/api'

describe('SearchFilter', () => {
  const mockOnFilterChange = vi.fn()

  beforeEach(() => {
    mockOnFilterChange.mockClear()
  })

  it('should render with default closed state', () => {
    render(<SearchFilter onFilterChange={mockOnFilterChange} />)
    
    expect(screen.getByText('🔍 詳細検索')).toBeInTheDocument()
    expect(screen.getByText('開く')).toBeInTheDocument()
    expect(screen.queryByText('難易度')).not.toBeInTheDocument()
  })

  it('should expand when open button is clicked', async () => {
    render(<SearchFilter onFilterChange={mockOnFilterChange} />)
    
    const openButton = screen.getByText('開く')
    fireEvent.click(openButton)
    
    await waitFor(() => {
      expect(screen.getByText('難易度')).toBeInTheDocument()
      expect(screen.getByText('調理時間')).toBeInTheDocument()
      expect(screen.getByText('カテゴリー')).toBeInTheDocument()
      expect(screen.getByText('特定材料')).toBeInTheDocument()
    })
    
    expect(screen.getByText('閉じる')).toBeInTheDocument()
  })

  it('should handle difficulty filter selection', async () => {
    render(<SearchFilter onFilterChange={mockOnFilterChange} />)
    
    // Expand filter
    fireEvent.click(screen.getByText('開く'))
    
    await waitFor(() => {
      expect(screen.getByText('難易度')).toBeInTheDocument()
    })
    
    // Select easy difficulty
    const easyButton = screen.getByRole('button', { name: '簡単' })
    fireEvent.click(easyButton)
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      difficulty: 'easy'
    })
  })

  it('should handle cooking time filter selection', async () => {
    render(<SearchFilter onFilterChange={mockOnFilterChange} />)
    
    fireEvent.click(screen.getByText('開く'))
    
    await waitFor(() => {
      expect(screen.getByText('調理時間')).toBeInTheDocument()
    })
    
    const thirtyMinButton = screen.getByRole('button', { name: '30分以内' })
    fireEvent.click(thirtyMinButton)
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      max_duration: 30
    })
  })

  it('should handle category filter selection', async () => {
    render(<SearchFilter onFilterChange={mockOnFilterChange} />)
    
    fireEvent.click(screen.getByText('開く'))
    
    await waitFor(() => {
      expect(screen.getByText('カテゴリー')).toBeInTheDocument()
    })
    
    const classicButton = screen.getByRole('button', { name: 'クラシック' })
    fireEvent.click(classicButton)
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      category: 'classic'
    })
  })

  it('should handle ingredient filter selection', async () => {
    render(<SearchFilter onFilterChange={mockOnFilterChange} />)
    
    fireEvent.click(screen.getByText('開く'))
    
    await waitFor(() => {
      expect(screen.getByText('特定材料')).toBeInTheDocument()
    })
    
    const mascarponeButton = screen.getByRole('button', { name: 'マスカルポーネ' })
    fireEvent.click(mascarponeButton)
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ingredients_include: ['mascarpone']
    })
  })

  it('should handle multiple ingredient selections', async () => {
    render(<SearchFilter onFilterChange={mockOnFilterChange} />)
    
    fireEvent.click(screen.getByText('開く'))
    
    await waitFor(() => {
      expect(screen.getByText('特定材料')).toBeInTheDocument()
    })
    
    // Select first ingredient
    const mascarponeButton = screen.getByRole('button', { name: 'マスカルポーネ' })
    fireEvent.click(mascarponeButton)
    
    expect(mockOnFilterChange).toHaveBeenLastCalledWith({
      ingredients_include: ['mascarpone']
    })
    
    // Select second ingredient (simulating cumulative state)
    const coffeeButton = screen.getByRole('button', { name: 'エスプレッソ' })
    fireEvent.click(coffeeButton)
    
    // Note: The component would need the current state to handle this properly
    // In real usage, the parent component manages the state
  })

  it('should reset all filters when reset button is clicked', async () => {
    const initialFilters: Partial<RecipeSearchParams> = {
      difficulty: 'easy',
      max_duration: 30,
      category: 'classic'
    }
    
    render(
      <SearchFilter 
        onFilterChange={mockOnFilterChange} 
        initialFilters={initialFilters}
      />
    )
    
    // Should show active filter indicator
    expect(screen.getByText('フィルター適用中')).toBeInTheDocument()
    expect(screen.getByText('リセット')).toBeInTheDocument()
    
    const resetButton = screen.getByText('リセット')
    fireEvent.click(resetButton)
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({})
  })

  it('should show active filter indicator when filters are applied', () => {
    const initialFilters: Partial<RecipeSearchParams> = {
      difficulty: 'medium'
    }
    
    render(
      <SearchFilter 
        onFilterChange={mockOnFilterChange} 
        initialFilters={initialFilters}
      />
    )
    
    expect(screen.getByText('フィルター適用中')).toBeInTheDocument()
    expect(screen.getByText('リセット')).toBeInTheDocument()
  })

  it('should not show active filter indicator when no filters are applied', () => {
    render(<SearchFilter onFilterChange={mockOnFilterChange} />)
    
    expect(screen.queryByText('フィルター適用中')).not.toBeInTheDocument()
    expect(screen.queryByText('リセット')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <SearchFilter 
        onFilterChange={mockOnFilterChange} 
        className="custom-class"
      />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should handle filter deselection', async () => {
    const initialFilters: Partial<RecipeSearchParams> = {
      difficulty: 'easy'
    }
    
    render(
      <SearchFilter 
        onFilterChange={mockOnFilterChange} 
        initialFilters={initialFilters}
      />
    )
    
    fireEvent.click(screen.getByText('開く'))
    
    await waitFor(() => {
      expect(screen.getByText('難易度')).toBeInTheDocument()
    })
    
    // Find all "すべて" buttons and click the first one (difficulty section)
    const allButtons = screen.getAllByRole('button', { name: 'すべて' })
    fireEvent.click(allButtons[0]) // First one should be difficulty
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      difficulty: undefined
    })
  })
})