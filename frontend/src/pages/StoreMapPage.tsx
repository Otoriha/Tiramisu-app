import React, { useState, useEffect } from 'react'
import { GoogleMap } from '../components'
import type { Store } from '../types/api'

const StoreMapPage: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [selectedRadius, setSelectedRadius] = useState(1) // 1kmデフォルト
  const [locationError, setLocationError] = useState<string>('')
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [viewMode] = useState<'map' | 'list'>('map')
  const [placesStores, setPlacesStores] = useState<Store[]>([]) // Places APIからの店舗
  const [isSearching, setIsSearching] = useState(false) // 検索中状態

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

  // Places APIのデータのみ使用
  const stores = placesStores
  const isLoading = false // Places APIの読み込み状態は別途管理
  const error = null

  // デバッグ用のログ
  console.log('🏪 Store data:', {
    placesStores,
    stores,
    userLocation,
    selectedRadius
  })

  const handleRadiusChange = (radius: number) => {
    setSelectedRadius(radius)
    if (userLocation) {
      setIsSearching(true) // 範囲変更時も検索開始
    }
  }

  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store)
  }

  const handlePlacesSearch = (places: Store[]) => {
    console.log('🔍 Places API検索結果:', places)
    setPlacesStores(places)
    setIsSearching(false) // 検索完了
  }

  // 位置情報が取得されたら検索開始
  useEffect(() => {
    if (userLocation && !isSearching) {
      setIsSearching(true)
    }
  }, [userLocation])

  const openInGoogleMaps = (store: Store) => {
    if (store.google_maps_url || store.website_url) {
      window.open(store.google_maps_url || store.website_url, '_blank')
    } else {
      // Google Maps URLがない場合は座標で検索
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`
      window.open(mapsUrl, '_blank')
    }
  }

  const getDirections = (store: Store) => {
    if (userLocation) {
      const directionsUrl = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${store.latitude},${store.longitude}`
      window.open(directionsUrl, '_blank')
    } else {
      openInGoogleMaps(store)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            ティラミス専門店マップ
          </h1>
          
        </div>

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
              {[1, 3, 5, 10].map((radius) => (
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
            {isSearching && (
              <p className="mt-3 text-sm text-blue-600">
                🔍 周辺の店舗を検索中...
              </p>
            )}
            {!isSearching && placesStores.length > 0 && (
              <p className="mt-3 text-sm text-green-600">
                ✅ {placesStores.length}件の実際の店舗が見つかりました
              </p>
            )}
            {!isSearching && placesStores.length === 0 && userLocation && (
              <p className="mt-3 text-sm text-gray-600">
                😔 周辺{selectedRadius}km以内に店舗が見つかりませんでした
              </p>
            )}
          </div>
        )}

        {/* コンテンツエリア */}
        <div className={`grid gap-6 ${viewMode === 'map' ? 'lg:grid-cols-3' : 'grid-cols-1'}`}>
          {/* マップ表示 */}
          {viewMode === 'map' && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-4">
                <GoogleMap
                  stores={stores}
                  userLocation={userLocation || undefined}
                  onStoreSelect={handleStoreSelect}
                  onPlacesSearch={handlePlacesSearch}
                  searchRadius={selectedRadius * 1000} // kmをmに変換
                  className="h-[600px]"
                />
              </div>
            </div>
          )}

          {/* ストア一覧 / 詳細 */}
          <div className={`${viewMode === 'map' ? 'lg:col-span-1' : 'w-full'}`}>
            {selectedStore ? (
              /* 選択された店舗の詳細 */
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold text-gray-800">店舗詳細</h2>
                    <button
                      onClick={() => setSelectedStore(null)}
                      className="text-gray-500 hover:text-gray-700"
                      title="閉じる"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {selectedStore.name}
                    {(selectedStore.distance_km || selectedStore.distance) && (
                      <span className="text-sm font-normal text-blue-600 ml-2">
                        {(selectedStore.distance_km || selectedStore.distance)?.toFixed(1)}km
                      </span>
                    )}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    {selectedStore.address && (
                      <div className="flex items-start">
                        <span className="mr-3 mt-1">📍</span>
                        <span className="text-gray-700">{selectedStore.address}</span>
                      </div>
                    )}
                    
                    {(selectedStore.phone_number || selectedStore.phone) && (
                      <div className="flex items-center">
                        <span className="mr-3">📞</span>
                        <a 
                          href={`tel:${selectedStore.phone_number || selectedStore.phone}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {selectedStore.phone_number || selectedStore.phone}
                        </a>
                      </div>
                    )}
                    
                    {(selectedStore.opening_hours || selectedStore.business_hours) && (
                      <div className="flex items-start">
                        <span className="mr-3 mt-1">🕒</span>
                        <span className="text-gray-700">{selectedStore.opening_hours || selectedStore.business_hours}</span>
                      </div>
                    )}
                    
                    {selectedStore.rating && (
                      <div className="flex items-center">
                        <span className="mr-3">⭐</span>
                        <span className="text-gray-700">
                          {selectedStore.rating.toFixed(1)} 
                          {selectedStore.review_count && (
                            <span className="text-gray-500 ml-1">
                              ({selectedStore.review_count}件)
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    
                    {selectedStore.price_level && (
                      <div className="flex items-center">
                        <span className="mr-3">💰</span>
                        <span className="text-gray-700">
                          {'¥'.repeat(selectedStore.price_level)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => openInGoogleMaps(selectedStore)}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      Google Mapsで見る
                    </button>
                    
                    {userLocation && (
                      <button
                        onClick={() => getDirections(selectedStore)}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                      >
                        🧭 道順を表示
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* ストア一覧 */
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
                  {stores.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {stores.length}件のストアが見つかりました
                    </p>
                  )}
                </div>

                <div className={`${viewMode === 'map' ? 'max-h-[500px] overflow-y-auto' : ''}`}>
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
                        <div 
                          key={store.id} 
                          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleStoreSelect(store)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 mb-1">
                                {store.name}
                                {(store.distance_km || store.distance) && (
                                  <span className="text-sm font-normal text-blue-600 ml-2">
                                    {(store.distance_km || store.distance)?.toFixed(1)}km
                                  </span>
                                )}
                              </h3>
                              
                              <div className="text-sm text-gray-600 space-y-1">
                                {store.address && (
                                  <p className="flex items-center">
                                    <span className="mr-2">📍</span>
                                    {store.address}
                                  </p>
                                )}
                                
                                {store.rating && (
                                  <p className="flex items-center">
                                    <span className="mr-2">⭐</span>
                                    {store.rating.toFixed(1)}
                                    {store.review_count && (
                                      <span className="text-gray-500 ml-1">
                                        ({store.review_count}件)
                                      </span>
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                openInGoogleMaps(store)
                              }}
                              className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                            >
                              地図で見る →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ヘルプテキスト */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            位置情報を許可すると、現在地から近い順にストアを表示します。
            {viewMode === 'map' && 'マップ上のマーカーをクリックして詳細を確認できます。'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default StoreMapPage