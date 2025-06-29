import React, { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
  loading?: 'lazy' | 'eager'
  quality?: number
  placeholder?: 'blur' | 'empty'
  className?: string
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  loading = 'lazy',
  quality = 80,
  placeholder = 'blur',
  className,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Generate responsive srcset
  const generateSrcSet = (basePath: string, originalWidth: number) => {
    const breakpoints = [640, 768, 1024, 1280, 1920]
    const relevantBreakpoints = breakpoints.filter(bp => bp <= originalWidth * 2)
    
    return relevantBreakpoints
      .map(bp => {
        const webpSrc = `${basePath}-${bp}.webp`
        return `${webpSrc} ${bp}w`
      })
      .join(', ')
  }

  // Generate fallback source for older browsers
  const generateFallbackSrc = (basePath: string, originalWidth: number) => {
    if (originalWidth >= 1920) return `${basePath}-1920.jpg`
    if (originalWidth >= 1280) return `${basePath}-1280.jpg`
    if (originalWidth >= 768) return `${basePath}-768.jpg`
    return `${basePath}-640.jpg`
  }

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoaded(true) // Still consider it "loaded" to hide placeholder
  }

  const srcSet = generateSrcSet(src, width)
  const fallbackSrc = generateFallbackSrc(src, width)

  const imageClasses = clsx(
    'transition-all duration-300',
    {
      'opacity-0': !isLoaded && placeholder === 'blur',
      'opacity-100': isLoaded || placeholder === 'empty',
      'blur-sm': !isLoaded && placeholder === 'blur',
      'blur-0': isLoaded,
    },
    className
  )

  const placeholderClasses = clsx(
    'absolute inset-0 transition-opacity duration-300',
    'bg-gradient-to-br from-luxury-cream-100 to-luxury-cream-200',
    'flex items-center justify-center',
    {
      'opacity-100': !isLoaded && placeholder === 'blur',
      'opacity-0': isLoaded,
    }
  )

  return (
    <div 
      ref={imgRef}
      className="relative overflow-hidden"
      style={{ aspectRatio: `${width}/${height}` }}
    >
      {/* Placeholder */}
      {placeholder === 'blur' && (
        <div className={placeholderClasses}>
          <div className="w-12 h-12 border-4 border-luxury-cream-300 border-t-luxury-warm-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Actual Image */}
      {(isInView || priority) && (
        <picture>
          {/* WebP source for modern browsers */}
          <source
            srcSet={srcSet}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            type="image/webp"
          />
          
          {/* Fallback for older browsers */}
          <img
            src={hasError ? '/images/fallback/tiramisu-placeholder.jpg' : fallbackSrc}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : loading}
            className={imageClasses}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />
        </picture>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-luxury-cream-100 flex items-center justify-center">
          <div className="text-center text-luxury-brown-600">
            <svg 
              className="w-12 h-12 mx-auto mb-2 opacity-50" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-sm">画像を読み込めませんでした</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default OptimizedImage