// Performance optimization utilities

// Lazy loading helper
export const lazyLoad = (threshold = 0.1) => {
  return (target: Element, callback: () => void) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            callback()
            observer.unobserve(target)
          }
        })
      },
      { threshold }
    )

    observer.observe(target)
    return () => observer.unobserve(target)
  }
}

// Debounce function with immediate option
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

// Throttle function
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Memoization helper
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map()

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

// RAF-based animation helper
export const animate = (
  duration: number,
  callback: (progress: number) => void,
  easing: (t: number) => number = (t) => t
) => {
  const start = performance.now()

  const frame = (time: number) => {
    const elapsed = time - start
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easing(progress)

    callback(easedProgress)

    if (progress < 1) {
      requestAnimationFrame(frame)
    }
  }

  requestAnimationFrame(frame)
}

// Easing functions
export const easing = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
}

// Image optimization helper
export const optimizeImage = (
  src: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'jpeg' | 'png'
  } = {}
) => {
  const { width, height, quality = 80, format = 'webp' } = options
  
  // This would typically integrate with an image optimization service
  // For now, return the original src with potential query parameters
  const url = new URL(src, window.location.origin)
  
  if (width) url.searchParams.set('w', width.toString())
  if (height) url.searchParams.set('h', height.toString())
  url.searchParams.set('q', quality.toString())
  url.searchParams.set('f', format)
  
  return url.toString()
}

// Preload resources
export const preloadResource = (href: string, as: string, type?: string) => {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  if (type) link.type = type
  
  document.head.appendChild(link)
  
  return () => {
    if (document.head.contains(link)) {
      document.head.removeChild(link)
    }
  }
}

// Critical resource loading
export const loadCriticalResource = async (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (src.endsWith('.css')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = src
      link.onload = () => resolve()
      link.onerror = reject
      document.head.appendChild(link)
    } else if (src.endsWith('.js')) {
      const script = document.createElement('script')
      script.src = src
      script.onload = () => resolve()
      script.onerror = reject
      document.head.appendChild(script)
    } else {
      reject(new Error('Unsupported resource type'))
    }
  })
}

// Bundle splitting helper for dynamic imports
export const dynamicImport = async <T>(
  importFn: () => Promise<{ default: T }>,
  fallback?: T
): Promise<T> => {
  try {
    const module = await importFn()
    return module.default
  } catch (error) {
    console.warn('Dynamic import failed:', error)
    if (fallback) return fallback
    throw error
  }
}

// Performance measurement
export const measurePerformance = (name: string, fn: () => void | Promise<void>) => {
  return async () => {
    const start = performance.now()
    await fn()
    const end = performance.now()
    console.log(`${name} took ${end - start} milliseconds`)
  }
}

// Efficient scroll position tracking
export const useScrollPosition = throttle((callback: (position: number) => void) => {
  callback(window.scrollY)
}, 16) // ~60fps

import React from 'react'

// Virtual scrolling helper (basic implementation)
export const createVirtualList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  _renderItem: (item: T, index: number) => React.ReactNode
) => {
  const [scrollTop, setScrollTop] = React.useState(0)
  
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  )
  
  const visibleItems = items.slice(startIndex, endIndex).map((item, index) => ({
    item,
    index: startIndex + index,
    style: {
      position: 'absolute' as const,
      top: (startIndex + index) * itemHeight,
      height: itemHeight
    }
  }))
  
  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop)
    }
  }
}

// Component lazy loading with error boundary
export const createLazyComponent = <P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  fallback?: React.ComponentType<P>
) => {
  return React.lazy(async () => {
    try {
      return await importFn()
    } catch (error) {
      console.error('Lazy component loading failed:', error)
      if (fallback) {
        return { default: fallback }
      }
      throw error
    }
  })
}

// Web Worker helper
export const createWorker = (workerFunction: () => void): Worker => {
  const blob = new Blob([`(${workerFunction.toString()})()`], {
    type: 'application/javascript'
  })
  
  return new Worker(URL.createObjectURL(blob))
}

// Service Worker registration
export const registerServiceWorker = async (swPath: string): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(swPath)
      console.log('Service Worker registered successfully:', registration)
      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return null
    }
  }
  return null
}