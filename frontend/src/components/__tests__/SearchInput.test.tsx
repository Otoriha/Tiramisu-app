import { render, screen, cleanup } from '@testing-library/react'
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
})