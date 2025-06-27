import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SkeletonCard } from '../SkeletonCard'

describe('SkeletonCard', () => {
  test('renders without crashing', () => {
    const { container } = render(<SkeletonCard />)
    
    const skeletonCard = container.querySelector('.animate-pulse')
    expect(skeletonCard).toBeInTheDocument()
  })

  test('applies animate-pulse class for loading animation', () => {
    const { container } = render(<SkeletonCard />)
    
    const skeletonCard = container.querySelector('.animate-pulse')
    expect(skeletonCard).toHaveClass('animate-pulse')
  })

  test('applies custom className when provided', () => {
    const customClass = 'custom-skeleton'
    const { container } = render(<SkeletonCard className={customClass} />)
    
    const skeletonCard = container.querySelector('.animate-pulse')
    expect(skeletonCard).toHaveClass(customClass)
  })

  test('has correct structure with placeholder elements', () => {
    const { container } = render(<SkeletonCard />)
    
    // Check for thumbnail placeholder
    const thumbnailPlaceholder = container.querySelector('.w-full.h-48.bg-gray-300')
    expect(thumbnailPlaceholder).toBeInTheDocument()
    
    // Check for duration placeholder
    const durationPlaceholder = container.querySelector('.bg-gray-400')
    expect(durationPlaceholder).toBeInTheDocument()
    
    // Check for title placeholders
    const titlePlaceholders = container.querySelectorAll('.h-4.bg-gray-300.rounded')
    expect(titlePlaceholders).toHaveLength(2)
  })

  test('maintains card structure similar to VideoCard', () => {
    const { container } = render(<SkeletonCard />)
    
    // Check for card container
    const cardContainer = container.querySelector('.bg-white.rounded-lg.shadow-md')
    expect(cardContainer).toBeInTheDocument()
    
    // Check for content padding
    const contentArea = container.querySelector('.p-4')
    expect(contentArea).toBeInTheDocument()
  })
})