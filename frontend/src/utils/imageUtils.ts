/**
 * 画像関連のユーティリティ関数
 */

export interface ImageBreakpoint {
  width: number
  format: 'webp' | 'jpg' | 'png'
}

export interface ResponsiveImageSet {
  srcSet: string
  sizes: string
  fallback: string
}

/**
 * レスポンシブ画像のsrcsetを生成
 */
export const generateResponsiveImageSet = (
  basePath: string,
  breakpoints: number[] = [640, 768, 1024, 1280, 1920],
  format: 'webp' | 'jpg' = 'webp'
): ResponsiveImageSet => {
  const srcSet = breakpoints
    .map(bp => `${basePath}-${bp}.${format} ${bp}w`)
    .join(', ')

  const sizes = [
    '(max-width: 640px) 100vw',
    '(max-width: 1024px) 50vw',
    '33vw'
  ].join(', ')

  const fallback = `${basePath}-${Math.max(...breakpoints)}.jpg`

  return { srcSet, sizes, fallback }
}

/**
 * 画像の最適サイズを計算
 */
export const calculateOptimalImageSize = (
  containerWidth: number,
  devicePixelRatio: number = window.devicePixelRatio || 1
): number => {
  const targetWidth = containerWidth * devicePixelRatio
  const breakpoints = [640, 768, 1024, 1280, 1920]
  
  return breakpoints.find(bp => bp >= targetWidth) || Math.max(...breakpoints)
}

/**
 * WebP対応チェック
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image()
    webP.onload = () => resolve(webP.width > 0 && webP.height > 0)
    webP.onerror = () => resolve(false)
    webP.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=='
  })
}

/**
 * 画像の遅延読み込み用のIntersection Observer設定
 */
export const createImageObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px 0px',
    threshold: 0.1,
    ...options
  }

  return new IntersectionObserver((entries) => {
    entries.forEach(callback)
  }, defaultOptions)
}

/**
 * 画像のプリロード
 */
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * 複数画像の並列プリロード
 */
export const preloadImages = async (
  sources: string[],
  options: { timeout?: number; parallel?: boolean } = {}
): Promise<HTMLImageElement[]> => {
  const { timeout = 10000, parallel = true } = options

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const timeoutId = setTimeout(() => {
        reject(new Error(`Image load timeout: ${src}`))
      }, timeout)

      img.onload = () => {
        clearTimeout(timeoutId)
        resolve(img)
      }
      
      img.onerror = () => {
        clearTimeout(timeoutId)
        reject(new Error(`Failed to load image: ${src}`))
      }
      
      img.src = src
    })
  }

  if (parallel) {
    return Promise.all(sources.map(loadImage))
  } else {
    const images: HTMLImageElement[] = []
    for (const src of sources) {
      try {
        const img = await loadImage(src)
        images.push(img)
      } catch (error) {
        console.warn('Failed to preload image:', src, error)
      }
    }
    return images
  }
}

/**
 * 画像フォーマットの決定
 */
export const determineImageFormat = async (
  basePath: string,
  preferredFormat: 'webp' | 'jpg' = 'webp'
): Promise<string> => {
  if (preferredFormat === 'jpg') {
    return `${basePath}.jpg`
  }

  const webpSupported = await supportsWebP()
  return webpSupported ? `${basePath}.webp` : `${basePath}.jpg`
}

/**
 * 画像のAspect Ratioを維持したサイズ計算
 */
export const calculateAspectRatioSize = (
  originalWidth: number,
  originalHeight: number,
  targetWidth?: number,
  targetHeight?: number
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight

  if (targetWidth && !targetHeight) {
    return {
      width: targetWidth,
      height: Math.round(targetWidth / aspectRatio)
    }
  }

  if (targetHeight && !targetWidth) {
    return {
      width: Math.round(targetHeight * aspectRatio),
      height: targetHeight
    }
  }

  if (targetWidth && targetHeight) {
    const targetAspectRatio = targetWidth / targetHeight
    
    if (targetAspectRatio > aspectRatio) {
      // 高さ基準でリサイズ
      return {
        width: Math.round(targetHeight * aspectRatio),
        height: targetHeight
      }
    } else {
      // 幅基準でリサイズ
      return {
        width: targetWidth,
        height: Math.round(targetWidth / aspectRatio)
      }
    }
  }

  return { width: originalWidth, height: originalHeight }
}

/**
 * 画像のブラー効果用のData URL生成
 */
export const generateBlurDataURL = (width: number = 10, height: number = 10): string => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  // 簡単なグラデーションブラー
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#F5F1E8')  // luxury-cream-300
  gradient.addColorStop(1, '#E8DDD4')  // luxury-cream-400
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  return canvas.toDataURL()
}