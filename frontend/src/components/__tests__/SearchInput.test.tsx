import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { SearchInput } from '../SearchInput'

describe('SearchInput', () => {
  const mockOnSearch = vi.fn()

  beforeEach(() => {
    mockOnSearch.mockClear()
  })

  afterEach(() => {
    cleanup()
    // Clean up any remaining DOM elements
    document.body.innerHTML = ''
  })

  it('renders input and button correctly', () => {
    render(<SearchInput onSearch={mockOnSearch} />)
    
    expect(screen.getByRole('textbox', { name: '検索入力' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '検索実行' })).toBeInTheDocument()
  })

  it('uses custom placeholder when provided', () => {
    const customPlaceholder = 'カスタム検索...'
    render(<SearchInput onSearch={mockOnSearch} placeholder={customPlaceholder} />)
    
    expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument()
  })

  it('calls onSearch when Enter key is pressed', async () => {
    const user = userEvent.setup()
    render(<SearchInput onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'test query')
    await user.keyboard('{Enter}')
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query')
    expect(mockOnSearch).toHaveBeenCalledTimes(1)
  })

  it('calls onSearch when button is clicked', async () => {
    const user = userEvent.setup()
    render(<SearchInput onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('textbox')
    const button = screen.getByRole('button', { name: '検索実行' })
    
    await user.type(input, 'button test query')
    await user.click(button)
    
    expect(mockOnSearch).toHaveBeenCalledWith('button test query')
    expect(mockOnSearch).toHaveBeenCalledTimes(1)
  })

  it('trims whitespace from search query', async () => {
    const user = userEvent.setup()
    render(<SearchInput onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, '  test query  ')
    await user.keyboard('{Enter}')
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query')
  })

  it('does not call onSearch for empty or whitespace-only queries', async () => {
    const user = userEvent.setup()
    render(<SearchInput onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('textbox')
    const button = screen.getByRole('button', { name: '検索実行' })
    
    // Test with empty string
    await user.keyboard('{Enter}')
    expect(mockOnSearch).not.toHaveBeenCalled()
    
    // Test with whitespace only
    await user.type(input, '   ')
    await user.keyboard('{Enter}')
    expect(mockOnSearch).not.toHaveBeenCalled()
    
    // Button should be disabled for empty/whitespace queries
    expect(button).toBeDisabled()
  })

  it('enables button only when there is non-empty text', async () => {
    const user = userEvent.setup()
    render(<SearchInput onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('textbox')
    const button = screen.getByRole('button', { name: '検索実行' })
    
    // Initially disabled
    expect(button).toBeDisabled()
    
    // Type some text
    await user.type(input, 'test')
    expect(button).toBeEnabled()
    
    // Clear text
    await user.clear(input)
    expect(button).toBeDisabled()
  })

  it('disables input and button when disabled prop is true', () => {
    render(<SearchInput onSearch={mockOnSearch} disabled={true} />)
    
    const input = screen.getByRole('textbox')
    const button = screen.getByRole('button', { name: '検索実行' })
    
    expect(input).toBeDisabled()
    expect(button).toBeDisabled()
  })

  it('has proper accessibility attributes', () => {
    render(<SearchInput onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('textbox')
    const button = screen.getByRole('button')
    
    expect(input).toHaveAttribute('aria-label', '検索入力')
    expect(button).toHaveAttribute('aria-label', '検索実行')
  })

  it('can be focused and navigated with keyboard', async () => {
    const user = userEvent.setup()
    render(<SearchInput onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('textbox')
    const button = screen.getByRole('button')
    
    // Tab to input
    await user.tab()
    expect(input).toHaveFocus()
    
    // Type and tab to button
    await user.type(input, 'test')
    await user.tab()
    expect(button).toHaveFocus()
    
    // Press space to activate button
    await user.keyboard(' ')
    expect(mockOnSearch).toHaveBeenCalledWith('test')
  })

  it('handles Enter key press correctly', async () => {
    const user = userEvent.setup()
    render(<SearchInput onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('textbox')
    
    // Add some text and press Enter
    await user.type(input, 'test')
    await user.keyboard('{Enter}')
    
    // Check that onSearch was called (indicating Enter was handled)
    expect(mockOnSearch).toHaveBeenCalledWith('test')
  })

  it('updates input value correctly', async () => {
    const user = userEvent.setup()
    const { container } = render(<SearchInput onSearch={mockOnSearch} />)
    
    const input = container.querySelector('input[type="text"]') as HTMLInputElement
    
    await user.type(input, 'changing text')
    expect(input.value).toBe('changing text')
    
    await user.clear(input)
    expect(input.value).toBe('')
  })

  describe('debounce functionality', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
      vi.clearAllMocks()
    })

    it('debounces API calls when typing', async () => {
      render(<SearchInput onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      
      // Type multiple characters
      fireEvent.change(input, { target: { value: 'test' } })
      
      // onSearch should not be called immediately
      expect(mockOnSearch).not.toHaveBeenCalled()
      
      // Advance timers by debounce delay (300ms)
      vi.advanceTimersByTime(300)
      
      // Now onSearch should be called once with the final value
      expect(mockOnSearch).toHaveBeenCalledOnce()
      expect(mockOnSearch).toHaveBeenCalledWith('test')
    })

    it('cancels previous debounced calls when typing continues', async () => {
      render(<SearchInput onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      
      // Type first part
      fireEvent.change(input, { target: { value: 'te' } })
      vi.advanceTimersByTime(200) // Less than 300ms
      
      // Type more before debounce completes
      fireEvent.change(input, { target: { value: 'test' } })
      
      // Advance full debounce time
      vi.advanceTimersByTime(300)
      
      // Should only be called once with the final value
      expect(mockOnSearch).toHaveBeenCalledOnce()
      expect(mockOnSearch).toHaveBeenCalledWith('test')
    })

    it('does not debounce Enter key press', async () => {
      render(<SearchInput onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      
      // Set value and press Enter
      fireEvent.change(input, { target: { value: 'immediate' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      
      // Should be called immediately without waiting for debounce
      expect(mockOnSearch).toHaveBeenCalledWith('immediate')
      
      // Advance timers and verify additional call from debounce
      vi.advanceTimersByTime(300)
      expect(mockOnSearch).toHaveBeenCalledTimes(2) // One from Enter, one from debounce
    })

    it('does not debounce button click', async () => {
      render(<SearchInput onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      const button = screen.getByRole('button', { name: '検索実行' })
      
      // Set value and click button
      fireEvent.change(input, { target: { value: 'click test' } })
      fireEvent.click(button)
      
      // Should be called immediately without waiting for debounce
      expect(mockOnSearch).toHaveBeenCalledWith('click test')
      
      // Advance timers and verify additional call from debounce
      vi.advanceTimersByTime(300)
      expect(mockOnSearch).toHaveBeenCalledTimes(2) // One from click, one from debounce
    })

    it('does not call API for empty or whitespace input via debounce', async () => {
      render(<SearchInput onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      
      // Type only whitespace
      fireEvent.change(input, { target: { value: '   ' } })
      
      // Wait for debounce
      vi.advanceTimersByTime(300)
      
      // Should not call onSearch for whitespace-only input
      expect(mockOnSearch).not.toHaveBeenCalled()
    })
  })
})