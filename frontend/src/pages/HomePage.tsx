import React from 'react'
import { Link } from 'react-router-dom'
import { useRecipes } from '../hooks/useRecipes'
import { useStores } from '../hooks/useStores'

const HomePage: React.FC = () => {
  // 人気レシピを取得（最初の6件）
  const { data: recipesResponse, isLoading: recipesLoading, error: recipesError } = useRecipes({
    per_page: 6
  })

  // 近くのストアを取得（最初の4件）
  const { data: storesResponse, isLoading: storesLoading, error: storesError } = useStores({
    per_page: 4
  })

  const recipes = recipesResponse?.data || []
  const stores = storesResponse?.data || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヒーローセクション */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            ティラミス専門アプリ
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            美味しいティラミスレシピと専門店を見つけよう
          </p>
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