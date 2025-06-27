import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRecipes } from '../hooks/useRecipes'
import { useStores } from '../hooks/useStores'
import { SearchInput } from '../components/SearchInput'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationError, setLocationError] = useState<string>('')

  // 人気レシピを取得（最初の6件）
  const { data: recipesResponse, isLoading: recipesLoading, error: recipesError } = useRecipes({
    per_page: 6
  })

  // 近くのストアを取得（位置情報があれば位置ベース、なければ最初の4件）
  const { data: storesResponse, isLoading: storesLoading, error: storesError } = useStores({
    ...(userLocation && {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      radius: 10
    }),
    per_page: 4
  })

  const recipes = recipesResponse?.data || []
  const stores = storesResponse?.data || []

  // レシピ検索ハンドラー
  const handleRecipeSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  // 位置情報を取得
  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
          setLocationError('')
        },
        (error) => {
          console.error('位置情報の取得に失敗:', error)
          setLocationError('位置情報の取得に失敗しました。設定を確認してください。')
        }
      )
    } else {
      setLocationError('このブラウザは位置情報をサポートしていません。')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヒーローセクション */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <span className="text-6xl mb-4 block">🍰</span>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
              ティラミスの世界
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              本格イタリアンティラミスから手作りレシピまで。<br className="hidden md:block" />
              あなたの特別な一日を甘く彩ります。
            </p>
          </div>
        </div>

        {/* 検索セクション */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            {/* レシピ検索 */}
            <div className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">レシピを探す</h3>
              <p className="text-gray-600 mb-6">
                お家で簡単に作れるレシピから<br />
                本格的なプロレシピまで
              </p>
              <SearchInput 
                onSearch={handleRecipeSearch}
                placeholder="レシピを検索..."
                className="max-w-md mx-auto"
              />
            </div>

            {/* ストア検索 */}
            <div className="text-center">
              <div className="text-4xl mb-4">🏦</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">専門店を探す</h3>
              <p className="text-gray-600 mb-6">
                あなたの近くのティラミス専門店や<br />
                おすすめカフェを見つけよう
              </p>
              <div className="space-y-3">
                {userLocation ? (
                  <div className="text-green-600 text-sm mb-3">
                    ✓ 位置情報を取得済み（近くの店舗を表示中）
                  </div>
                ) : (
                  <button
                    onClick={handleGetLocation}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mb-3"
                  >
                    📍 現在地から探す
                  </button>
                )}
                <div>
                  <Link
                    to="/stores"
                    className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    全ての店舗を見る
                  </Link>
                </div>
                {locationError && (
                  <div className="text-red-600 text-sm mt-2">
                    {locationError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 人気レシピセクション */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">人気のレシピ</h2>
            <Link 
              to="/recipes" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              すべて見る →
            </Link>
          </div>

          {recipesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : recipesError ? (
            <div className="text-center py-8 text-red-600">
              レシピの読み込み中にエラーが発生しました
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <Link 
                  key={recipe.id} 
                  to={`/recipes/${recipe.id}`}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {recipe.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {recipe.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {recipe.difficulty === 'easy' ? '簡単' :
                       recipe.difficulty === 'medium' ? '普通' : '難しい'}
                    </span>
                    <span>{recipe.cooking_time}分</span>
                    <span>👁 {recipe.views_count}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 近くのストアセクション */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">ティラミス専門店</h2>
            <Link 
              to="/stores" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              地図で見る →
            </Link>
          </div>

          {storesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : storesError ? (
            <div className="text-center py-8 text-red-600">
              ストア情報の読み込み中にエラーが発生しました
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stores.map((store) => (
                <div key={store.id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {store.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    📍 {store.address}
                  </p>
                  <p className="text-gray-600 text-sm mb-2">
                    📞 {store.phone}
                  </p>
                  <p className="text-gray-600 text-sm mb-3">
                    🕒 {store.business_hours}
                  </p>
                  {store.google_maps_url && (
                    <a 
                      href={store.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Google Mapsで開く →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default HomePage