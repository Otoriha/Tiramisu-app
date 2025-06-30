import { useEffect, useState } from 'react'

// Reduced motion preference detection
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// High contrast preference detection
export const useHighContrast = (): boolean => {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setPrefersHighContrast(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersHighContrast
}

// Focus management hook
export const useFocusManagement = () => {
  const [focusedElement, setFocusedElement] = useState<Element | null>(null)

  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      setFocusedElement(e.target as Element)
    }

    const handleBlur = () => {
      setFocusedElement(null)
    }

    document.addEventListener('focusin', handleFocus)
    document.addEventListener('focusout', handleBlur)

    return () => {
      document.removeEventListener('focusin', handleFocus)
      document.removeEventListener('focusout', handleBlur)
    }
  }, [])

  const focusElement = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement
    element?.focus()
  }

  const trapFocus = (containerSelector: string) => {
    const container = document.querySelector(containerSelector)
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }

  return {
    focusedElement,
    focusElement,
    trapFocus
  }
}

// Keyboard navigation hook
export const useKeyboardNavigation = (
  items: string[],
  options: {
    loop?: boolean
    onSelect?: (index: number) => void
    orientation?: 'horizontal' | 'vertical'
  } = {}
) => {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const { loop = true, onSelect, orientation = 'vertical' } = options

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isVertical = orientation === 'vertical'
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight'
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft'

    switch (e.key) {
      case nextKey:
        e.preventDefault()
        setSelectedIndex(prev => {
          const nextIndex = prev < items.length - 1 ? prev + 1 : loop ? 0 : prev
          return nextIndex
        })
        break
      case prevKey:
        e.preventDefault()
        setSelectedIndex(prev => {
          const nextIndex = prev > 0 ? prev - 1 : loop ? items.length - 1 : prev
          return nextIndex
        })
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (selectedIndex >= 0) {
          onSelect?.(selectedIndex)
        }
        break
      case 'Home':
        e.preventDefault()
        setSelectedIndex(0)
        break
      case 'End':
        e.preventDefault()
        setSelectedIndex(items.length - 1)
        break
    }
  }

  return {
    selectedIndex,
    setSelectedIndex,
    handleKeyDown
  }
}

// Screen reader announcements
export const useScreenReader = () => {
  const [announcements, setAnnouncements] = useState<string[]>([])

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncements(prev => [...prev, message])

    // Create live region for screen reader
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.setAttribute('class', 'sr-only')
    liveRegion.textContent = message

    document.body.appendChild(liveRegion)

    // Clean up after announcement
    setTimeout(() => {
      document.body.removeChild(liveRegion)
      setAnnouncements(prev => prev.filter(a => a !== message))
    }, 1000)
  }

  return {
    announcements,
    announce
  }
}

// Skip link management
export const useSkipLinks = () => {
  useEffect(() => {
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.textContent = 'メインコンテンツにスキップ'
    skipLink.className = 'skip-link'
    skipLink.addEventListener('click', (e) => {
      e.preventDefault()
      const mainContent = document.getElementById('main-content')
      if (mainContent) {
        mainContent.focus()
        mainContent.scrollIntoView()
      }
    })

    document.body.insertBefore(skipLink, document.body.firstChild)

    return () => {
      if (document.body.contains(skipLink)) {
        document.body.removeChild(skipLink)
      }
    }
  }, [])
}

// Color contrast utilities
export const getContrastRatio = (color1: string, color2: string): number => {
  // This is a simplified version - in production, use a library like chroma.js
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16)
    const r = (rgb >> 16) & 255
    const g = (rgb >> 8) & 255
    const b = rgb & 255
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const l1 = getLuminance(color1)
  const l2 = getLuminance(color2)
  const brightest = Math.max(l1, l2)
  const darkest = Math.min(l1, l2)
  
  return (brightest + 0.05) / (darkest + 0.05)
}

export const meetsWCAGContrast = (color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
  const ratio = getContrastRatio(color1, color2)
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7
}

// Comprehensive accessibility hook
export const useAccessibility = () => {
  const reducedMotion = useReducedMotion()
  const highContrast = useHighContrast()
  const focusManagement = useFocusManagement()
  const screenReader = useScreenReader()

  useSkipLinks()

  return {
    reducedMotion,
    highContrast,
    ...focusManagement,
    ...screenReader,
    meetsWCAGContrast,
    getContrastRatio
  }
}