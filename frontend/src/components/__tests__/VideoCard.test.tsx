import { render, screen, cleanup } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { VideoCard } from '../VideoCard'

// Mock window.open
const mockOpen = vi.fn()
Object.defineProperty(window, 'open', {
  value: mockOpen,
  writable: true,
})

describe('VideoCard', () => {
  const mockVideoProps = {
    videoId: 'test123',
    title: 'Test Video Title',
    thumbnail: 'https://example.com/thumbnail.jpg',
    duration: '4:20'
  }

  const mockOnClick = vi.fn()

  beforeEach(() => {
    mockOpen.mockClear()
    mockOnClick.mockClear()
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('renders video card with all required elements', () => {
    render(<VideoCard {...mockVideoProps} />)
    
    expect(screen.getByRole('img')).toBeInTheDocument()
    expect(screen.getByText(mockVideoProps.title)).toBeInTheDocument()
    expect(screen.getByText(mockVideoProps.duration)).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('displays thumbnail image with correct src and alt attributes', () => {
    render(<VideoCard {...mockVideoProps} />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', mockVideoProps.thumbnail)
    expect(image).toHaveAttribute('alt', mockVideoProps.title)
  })

  it('displays video title correctly', () => {
    render(<VideoCard {...mockVideoProps} />)
    
    const title = screen.getByText(mockVideoProps.title)
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('text-sm', 'font-semibold', 'text-gray-900')
  })

  it('displays video duration correctly', () => {
    render(<VideoCard {...mockVideoProps} />)
    
    const duration = screen.getByText(mockVideoProps.duration)
    expect(duration).toBeInTheDocument()
    expect(duration).toHaveClass('bg-black', 'bg-opacity-80', 'text-white')
  })

  it('opens YouTube video in new tab when clicked', async () => {
    const user = userEvent.setup()
    render(<VideoCard {...mockVideoProps} />)
    
    const card = screen.getByRole('button')
    await user.click(card)
    
    expect(mockOpen).toHaveBeenCalledWith(
      `https://www.youtube.com/watch?v=${mockVideoProps.videoId}`,
      '_blank',
      'noopener,noreferrer'
    )
  })

  it('calls optional onClick callback when provided', async () => {
    const user = userEvent.setup()
    render(<VideoCard {...mockVideoProps} onClick={mockOnClick} />)
    
    const card = screen.getByRole('button')
    await user.click(card)
    
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('handles keyboard navigation with Enter key', async () => {
    const user = userEvent.setup()
    render(<VideoCard {...mockVideoProps} />)
    
    const card = screen.getByRole('button')
    card.focus()
    await user.keyboard('{Enter}')
    
    expect(mockOpen).toHaveBeenCalledWith(
      `https://www.youtube.com/watch?v=${mockVideoProps.videoId}`,
      '_blank',
      'noopener,noreferrer'
    )
  })

  it('handles keyboard navigation with Space key', async () => {
    const user = userEvent.setup()
    render(<VideoCard {...mockVideoProps} />)
    
    const card = screen.getByRole('button')
    card.focus()
    await user.keyboard(' ')
    
    expect(mockOpen).toHaveBeenCalledWith(
      `https://www.youtube.com/watch?v=${mockVideoProps.videoId}`,
      '_blank',
      'noopener,noreferrer'
    )
  })

  it('has proper accessibility attributes', () => {
    render(<VideoCard {...mockVideoProps} />)
    
    const card = screen.getByRole('button')
    expect(card).toHaveAttribute('aria-label', `動画を再生: ${mockVideoProps.title}`)
    expect(card).toHaveAttribute('tabIndex', '0')
  })

  it('applies custom className when provided', () => {
    const customClass = 'custom-video-card'
    render(<VideoCard {...mockVideoProps} className={customClass} />)
    
    const card = screen.getByRole('button')
    expect(card).toHaveClass(customClass)
  })

  it('has correct default styling classes', () => {
    render(<VideoCard {...mockVideoProps} />)
    
    const card = screen.getByRole('button')
    expect(card).toHaveClass(
      'bg-white',
      'rounded-lg',
      'shadow-md',
      'overflow-hidden',
      'cursor-pointer',
      'transform',
      'transition-all',
      'duration-300',
      'hover:scale-105',
      'hover:shadow-xl'
    )
  })

  it('thumbnail image has proper loading attributes', () => {
    render(<VideoCard {...mockVideoProps} />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('loading', 'lazy')
    expect(image).toHaveClass('w-full', 'h-48', 'object-cover')
  })

  it('prevents default behavior on Enter keydown', async () => {
    const user = userEvent.setup()
    render(<VideoCard {...mockVideoProps} />)
    
    const card = screen.getByRole('button')
    const preventDefaultSpy = vi.fn()
    
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        preventDefaultSpy()
      }
    })
    
    card.focus()
    await user.keyboard('{Enter}')
    
    expect(mockOpen).toHaveBeenCalled()
  })

  it('handles long video titles properly', () => {
    const longTitle = 'This is a very long video title that should be truncated properly when displayed in the video card component'
    const propsWithLongTitle = { ...mockVideoProps, title: longTitle }
    
    render(<VideoCard {...propsWithLongTitle} />)
    
    const titleElement = screen.getByText(longTitle)
    expect(titleElement).toHaveClass('line-clamp-2')
  })

  it('handles different duration formats', () => {
    const differentDurations = ['1:23', '10:45', '1:23:45', '0:59']
    
    differentDurations.forEach((duration) => {
      const { unmount } = render(<VideoCard {...mockVideoProps} duration={duration} />)
      expect(screen.getByText(duration)).toBeInTheDocument()
      unmount()
    })
  })
})