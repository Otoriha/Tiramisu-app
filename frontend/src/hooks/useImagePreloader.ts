import { useState, useEffect } from 'react'

interface ImagePreloaderOptions {
  priority?: boolean
  timeout?: number
}

interface PreloadState {
  loaded: boolean
  error: boolean
  loading: boolean
}

/**
 * カスタムフック: 画像の事前読み込み
 * 重要な画像を事前に読み込んでユーザー体験を向上させる
 */
export const useImagePreloader = (
  images: string | string[],
  options: ImagePreloaderOptions = {}
): PreloadState => {
  const { priority = false, timeout = 10000 } = options
  const [state, setState] = useState<PreloadState>({
    loaded: false,
    error: false,
    loading: false
  })

  useEffect(() => {
    if (!priority && !images) return

    const imageList = Array.isArray(images) ? images : [images]
    if (imageList.length === 0) return

    setState(prev => ({ ...prev, loading: true }))

    let loadedCount = 0
    let errorCount = 0
    const totalImages = imageList.length

    const handleImageLoad = () => {
      loadedCount++
      if (loadedCount === totalImages) {
        setState({
          loaded: true,
          error: false,
          loading: false
        })
      }
    }

    const handleImageError = () => {
      errorCount++
      if (errorCount === totalImages) {
        setState({
          loaded: false,
          error: true,
          loading: false
        })
      } else if (loadedCount + errorCount === totalImages) {
        setState({
          loaded: loadedCount > 0,
          error: errorCount > 0,
          loading: false
        })
      }
    }

    // タイムアウト設定
    const timeoutId = setTimeout(() => {
      setState({
        loaded: loadedCount > 0,
        error: loadedCount === 0,
        loading: false
      })
    }, timeout)

    // 画像の事前読み込み
    const imageElements = imageList.map(src => {
      const img = new Image()
      img.onload = handleImageLoad
      img.onerror = handleImageError
      
      // WebP対応チェック
      if (src.includes('.webp')) {
        // WebP未対応ブラウザの場合はJPEGにフォールバック
        const canvas = document.createElement('canvas')
        const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
        
        if (!supportsWebP) {
          img.src = src.replace(/\.webp$/, '.jpg')
        } else {
          img.src = src
        }
      } else {
        img.src = src
      }
      
      return img
    })

    return () => {
      clearTimeout(timeoutId)
      imageElements.forEach(img => {
        img.onload = null
        img.onerror = null
      })
    }
  }, [images, priority, timeout])

  return state
}

/**
 * 重要な画像の事前読み込み（ヒーロー画像など）
 */
export const useCriticalImagePreloader = (images: string | string[]) => {
  return useImagePreloader(images, { priority: true, timeout: 5000 })
}

/**
 * 製品画像の事前読み込み
 */
export const useProductImagePreloader = (images: string | string[]) => {
  return useImagePreloader(images, { priority: false, timeout: 8000 })
}