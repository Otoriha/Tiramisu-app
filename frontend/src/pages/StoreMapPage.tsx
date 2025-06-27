import React, { useState, useEffect } from 'react'
import { useStores } from '../hooks/useStores'
import type { Store } from '../types/api'

const StoreMapPage: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [selectedRadius, setSelectedRadius] = useState(5) // 5kmデフォルト
  const [locationError, setLocationError] = useState<string>('')

  // 現在地を取得
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          console.error('位置情報の取得に失敗:', error)
          setLocationError('位置情報の取得に失敗しました。ブラウザの設定を確認してください。')
        }
      )
    } else {
      setLocationError('このブラウザは位置情報をサポートしていません。')
    }
  }, [])

  // ストアデータを取得（位置情報がある場合は方側検索）
  const { data: storesResponse, isLoading, error } = useStores({
    ...(userLocation && {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      radius: selectedRadius
    }),
    per_page: 20
  })

  const stores = storesResponse?.data || []

  const handleRadiusChange = (radius: number) => {
    setSelectedRadius(radius)
  }

  const openInGoogleMaps = (store: Store) => {
    if (store.google_maps_url) {
      window.open(store.google_maps_url, '_blank')
    } else {
      // Google Maps URLがない場合は座標で検索
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`
      window.open(mapsUrl, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          ティラミス専門店マップ
        </h1>

        {/* 位置情報エラー */}
        {locationError && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            {locationError}
          </div>
        )}

        {/* 検索フィルター */}
        {userLocation && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">検索範囲</h2>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">現在地から:</span>
              {[1, 3, 5, 10, 20].map((radius) => (
                <button
                  key={radius}
                  onClick={() => handleRadiusChange(radius)}
                  className={`px-4 py-2 rounded ${
                    selectedRadius === radius
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {radius}km
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ストア一覧 */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              ストア一覧
              {userLocation && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  (現在地から{selectedRadius}km以内)
                </span>
              )}
            </h2>
          </div>

          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">
              ストア情報の読み込み中にエラーが発生しました。
            </div>
          ) : stores.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              {userLocation 
                ? `現在地から${selectedRadius}km以内にストアが見つかりませんでした。`
                : 'ストアが見つかりませんでした。'
              }
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {stores.map((store) => (
                <div key={store.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {store.name}
                        {store.distance && (
                          <span className="text-sm font-normal text-blue-600 ml-2">
                            {store.distance.toFixed(1)}km
                          </span>
                        )}
                      </h3>
                      
                      <div className="space-y-1 text-gray-600">
                        <p className="flex items-center">
                          <span className="mr-2">📍</span>
                          {store.address}
                        </p>
                        <p className="flex items-center">
                          <span className="mr-2">📞</span>
                          {store.phone}
                        </p>
                        <p className="flex items-center">
                          <span className="mr-2">🕒</span>
                          {store.business_hours}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => openInGoogleMaps(store)}
                      className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      地図で見る
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ヘルプテキスト */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            位置情報を許可すると、現在地から近い順にストアを表示します。
          </p>
        </div>
      </div>
    </div>
  )
}

export default StoreMapPage