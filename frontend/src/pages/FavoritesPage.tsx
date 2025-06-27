import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFavorites } from '../hooks/useFavorites'
import type { Recipe, Store } from '../types/api'

const FavoritesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recipes' | 'stores'>('recipes')
  const { data: favoritesResponse, isLoading, error, deleteMutation } = useFavorites()

  const favorites = favoritesResponse?.data || []
  const recipesFavorites = favorites.filter(fav => fav.favoritable_type === 'Recipe')
  const storesFavorites = favorites.filter(fav => fav.favoritable_type === 'Store')

  const handleRemoveFavorite = (favoriteId: number) => {
    if (confirm('お気に入りから削除しますか？')) {
      deleteMutation.mutate(favoriteId)
    }
  }

  const renderRecipeCard = (recipe: Recipe, favoriteId: number) => (
    <div key={favoriteId} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <Link to={`/recipes/${recipe.id}`} className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors">
            {recipe.name}
          </h3>
        </Link>
        <button
          onClick={() => handleRemoveFavorite(favoriteId)}
          disabled={deleteMutation.isPending}
          className="text-red-600 hover:text-red-800 ml-2 disabled:opacity-50"
          title="お気に入りから削除"
        >
          ✕
        </button>
      </div>
      
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {recipe.description}
      </p>
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span className={`px-2 py-1 rounded ${
          recipe.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
          recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {recipe.difficulty === 'easy' ? '簡単' :
           recipe.difficulty === 'medium' ? '普通' : '難しい'}
        </span>
        <span>{recipe.cooking_time}分</span>
        <span>👁 {recipe.views_count}</span>
      </div>
    </div>
  )

  const renderStoreCard = (store: Store, favoriteId: number) => (
    <div key={favoriteId} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex-1">
          {store.name}
        </h3>
        <button
          onClick={() => handleRemoveFavorite(favoriteId)}
          disabled={deleteMutation.isPending}
          className="text-red-600 hover:text-red-800 ml-2 disabled:opacity-50"
          title="お気に入りから削除"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-1 text-gray-600 text-sm mb-4">
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
      
      {store.google_maps_url && (
        <a 
          href={store.google_maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
        >
          地図で見る
        </a>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">お気に入り</h1>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">エラーが発生しました</h1>
          <p className="text-gray-600 mb-4">お気に入りの読み込み中にエラーが発生しました。</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">お気に入り</h1>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'recipes'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              レシピ ({recipesFavorites.length})
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'stores'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              ストア ({storesFavorites.length})
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        {activeTab === 'recipes' ? (
          <div>
            {recipesFavorites.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 mb-4">お気に入りのレシピがありません。</p>
                <Link
                  to="/"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors"
                >
                  レシピを探す
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipesFavorites.map((favorite) => 
                  renderRecipeCard(favorite.favoritable as Recipe, favorite.id)
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            {storesFavorites.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 mb-4">お気に入りのストアがありません。</p>
                <Link
                  to="/stores"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors"
                >
                  ストアを探す
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {storesFavorites.map((favorite) => 
                  renderStoreCard(favorite.favoritable as Store, favorite.id)
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FavoritesPage