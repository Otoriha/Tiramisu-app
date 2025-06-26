import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { VideoGrid } from '../VideoGrid'
import type { VideoCardProps } from '../VideoCard'

const mockVideos: VideoCardProps[] = [
  {
    videoId: "1",
    title: "Test Video 1",
    thumbnail: "https://example.com/thumb1.jpg",
    duration: "3:33"
  },
  {
    videoId: "2", 
    title: "Test Video 2",
    thumbnail: "https://example.com/thumb2.jpg",
    duration: "4:12"
  },
  {
    videoId: "3",
    title: "Test Video 3", 
    thumbnail: "https://example.com/thumb3.jpg",
    duration: "2:45"
  },
  {
    videoId: "4",
    title: "Test Video 4",
    thumbnail: "https://example.com/thumb4.jpg",
    duration: "5:21"
  },
  {
    videoId: "5",
    title: "Test Video 5",
    thumbnail: "https://example.com/thumb5.jpg",
    duration: "1:58"
  },
  {
    videoId: "6",
    title: "Test Video 6",
    thumbnail: "https://example.com/thumb6.jpg", 
    duration: "6:12"
  }
]

describe('VideoGrid', () => {
  it('renders all videos when no maxRows is set', () => {
    render(<VideoGrid videos={mockVideos} />)
    
    mockVideos.forEach(video => {
      expect(screen.getByText(video.title)).toBeInTheDocument()
    })
  })

  it('limits videos by maxRows when set', () => {
    render(<VideoGrid videos={mockVideos} columns={2} maxRows={2} />)
    
    // Should show only 4 videos (2 columns × 2 rows)
    expect(screen.getByText("Test Video 1")).toBeInTheDocument()
    expect(screen.getByText("Test Video 2")).toBeInTheDocument()
    expect(screen.getByText("Test Video 3")).toBeInTheDocument()
    expect(screen.getByText("Test Video 4")).toBeInTheDocument()
    expect(screen.queryByText("Test Video 5")).not.toBeInTheDocument()
    expect(screen.queryByText("Test Video 6")).not.toBeInTheDocument()
  })

  it('applies correct CSS classes for column configuration', () => {
    const { container } = render(<VideoGrid videos={mockVideos} columns={4} />)
    const gridElement = container.firstChild as HTMLElement
    
    expect(gridElement).toHaveClass('grid')
    expect(gridElement).toHaveClass('grid-cols-1')
    expect(gridElement).toHaveClass('sm:grid-cols-2') 
    expect(gridElement).toHaveClass('lg:grid-cols-3')
    expect(gridElement).toHaveClass('xl:grid-cols-4')
  })

  it('applies correct gap classes', () => {
    const { container } = render(<VideoGrid videos={mockVideos} gap={8} />)
    const gridElement = container.firstChild as HTMLElement
    
    expect(gridElement).toHaveClass('gap-2')
  })

  it('applies custom className when provided', () => {
    const { container } = render(<VideoGrid videos={mockVideos} className="custom-class" />)
    const gridElement = container.firstChild as HTMLElement
    
    expect(gridElement).toHaveClass('custom-class')
  })

  it('renders empty grid when no videos provided', () => {
    const { container } = render(<VideoGrid videos={[]} />)
    const gridElement = container.firstChild as HTMLElement
    
    expect(gridElement).toHaveClass('grid')
    expect(gridElement.children).toHaveLength(0)
  })

  it('handles single column layout correctly', () => {
    const { container } = render(<VideoGrid videos={mockVideos} columns={1} />)
    const gridElement = container.firstChild as HTMLElement
    
    expect(gridElement).toHaveClass('grid-cols-1')
    expect(gridElement).not.toHaveClass('sm:grid-cols-2')
  })

  it('handles different gap sizes correctly', () => {
    const testCases = [
      { gap: 8, expectedClass: 'gap-2' },
      { gap: 12, expectedClass: 'gap-3' },
      { gap: 16, expectedClass: 'gap-4' },
      { gap: 20, expectedClass: 'gap-5' },
      { gap: 24, expectedClass: 'gap-6' },
      { gap: 32, expectedClass: 'gap-8' }
    ]

    testCases.forEach(({ gap, expectedClass }) => {
      const { container } = render(<VideoGrid videos={mockVideos} gap={gap} />)
      const gridElement = container.firstChild as HTMLElement
      expect(gridElement).toHaveClass(expectedClass)
    })
  })

  it('maxRows calculation works correctly with different column counts', () => {
    const { rerender } = render(<VideoGrid videos={mockVideos} columns={3} maxRows={1} />)
    
    // Should show 3 videos (3 columns × 1 row)
    expect(screen.getByText("Test Video 1")).toBeInTheDocument()
    expect(screen.getByText("Test Video 2")).toBeInTheDocument()
    expect(screen.getByText("Test Video 3")).toBeInTheDocument()
    expect(screen.queryByText("Test Video 4")).not.toBeInTheDocument()

    rerender(<VideoGrid videos={mockVideos} columns={2} maxRows={2} />)
    
    // Should show 4 videos (2 columns × 2 rows)
    expect(screen.getByText("Test Video 4")).toBeInTheDocument()
    expect(screen.queryByText("Test Video 5")).not.toBeInTheDocument()
  })
})