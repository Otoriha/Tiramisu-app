import React, { useEffect, useRef, useState } from 'react'
import type { Store } from '../types/api'

interface GoogleMapProps {
  stores: Store[]
  userLocation?: { latitude: number; longitude: number }
  onStoreSelect?: (store: Store) => void
  className?: string
}

interface GoogleMapInstance {
  setCenter: (latLng: any) => void
  setZoom: (zoom: number) => void
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  stores,
  userLocation,
  onStoreSelect,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<GoogleMapInstance | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const markersRef = useRef<any[]>([])

  // Google Maps APIの読み込みチェック
  const checkGoogleMapsLoaded = (): boolean => {
    return typeof window !== 'undefined' && (window as any).google && (window as any).google.maps
  }

  // Google Maps APIを動的に読み込む
  const loadGoogleMapsAPI = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (checkGoogleMapsLoaded()) {
        resolve()
        return
      }

      // 既存のスクリプトタグがあるかチェック
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve())
        existingScript.addEventListener('error', reject)
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyB8ZjTsAJNP7Xr3b1_hFkBk_zXmL0YvQhs'}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  // マップの初期化
  const initializeMap = () => {
    if (!mapRef.current || !checkGoogleMapsLoaded()) return

    const defaultCenter = userLocation 
      ? { lat: userLocation.latitude, lng: userLocation.longitude }
      : { lat: 35.6762, lng: 139.6503 } // 東京駅をデフォルト

    const mapInstance = new (window as any).google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: userLocation ? 13 : 10,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    })

    setMap(mapInstance)
    setIsMapLoaded(true)
  }

  // マーカーを追加
  const addMarkers = () => {
    if (!map || !checkGoogleMapsLoaded()) return

    // 既存のマーカーをクリア
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // ユーザーの現在地マーカー
    if (userLocation) {
      const userMarker = new (window as any).google.maps.Marker({
        position: { lat: userLocation.latitude, lng: userLocation.longitude },
        map: map as any,
        title: '現在地',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="white"/>
            </svg>
          `),
          scaledSize: new (window as any).google.maps.Size(24, 24)
        }
      })
      markersRef.current.push(userMarker)
    }

    // 店舗マーカー
    stores.forEach(store => {
      if (store.latitude && store.longitude) {
        const marker = new (window as any).google.maps.Marker({
          position: { lat: store.latitude, lng: store.longitude },
          map: map as any,
          title: store.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#DC2626" stroke="white" stroke-width="1"/>
                <circle cx="12" cy="9" r="2.5" fill="white"/>
                <text x="12" y="10" text-anchor="middle" fill="#DC2626" font-size="8" font-weight="bold">🍰</text>
              </svg>
            `),
            scaledSize: new (window as any).google.maps.Size(32, 32)
          }
        })

        // マーカークリック時の処理
        marker.addListener('click', () => {
          onStoreSelect?.(store)
        })

        markersRef.current.push(marker)
      }
    })
  }

  // Google Maps APIの読み込み
  useEffect(() => {
    loadGoogleMapsAPI()
      .then(initializeMap)
      .catch(error => {
        console.error('Google Maps API の読み込みに失敗しました:', error)
      })
  }, [])

  // マップが読み込まれた後にマーカーを追加
  useEffect(() => {
    if (isMapLoaded) {
      addMarkers()
    }
  }, [isMapLoaded, stores, userLocation])

  // 地図の中心を更新
  useEffect(() => {
    if (map && userLocation) {
      map.setCenter({ lat: userLocation.latitude, lng: userLocation.longitude })
      map.setZoom(13)
    }
  }, [map, userLocation])

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef}
        className="w-full h-full min-h-[400px] rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      />
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">マップを読み込み中...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default GoogleMap