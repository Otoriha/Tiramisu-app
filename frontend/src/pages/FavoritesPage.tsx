import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFavorites } from '../hooks/useFavorites'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/button'
import { Loading } from '../components/ui/Loading'
import { Modal, useModal, ConfirmationModal } from '../components/ui/Modal'
import type { Recipe, Store } from '../types/api'
import { Heart, Clock, MapPin, Phone, Building, Search, X, ExternalLink } from 'lucide-react'

const FavoritesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recipes' | 'stores'>('recipes')
  const { data: favoritesResponse, isLoading, error, deleteMutation } = useFavorites()

  const favorites = favoritesResponse?.data || []
  const recipesFavorites = favorites.filter(fav => fav.favoritable_type === 'Recipe')
  const storesFavorites = favorites.filter(fav => fav.favoritable_type === 'Store')

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const handleRemoveFavorite = (favoriteId: number) => {
    setConfirmDeleteId(favoriteId)
  }

  const confirmDelete = () => {
    if (confirmDeleteId) {
      deleteMutation.mutate(confirmDeleteId)
      setConfirmDeleteId(null)
    }
  }

  const renderRecipeCard = (recipe: Recipe, favoriteId: number) => {
    // APIレスポンスのプロパティ名に合わせて修正
    const title = recipe.title
    const duration = recipe.duration
    // const viewCount = recipe.view_count || 0
    const thumbnailUrl = recipe.thumbnail_url
    
    return (
      <div key={favoriteId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* サムネイル画像 */}
        {thumbnailUrl && (
          <Link to={`/recipes/${recipe.id}`}>
            <div className="aspect-video bg-gray-100 overflow-hidden">
              <img 
                src={thumbnailUrl} 
                alt={title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image'
                }}
              />
            </div>
          </Link>
        )}
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <Link to={`/recipes/${recipe.id}`} className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2">
                {title}
              </h3>
            </Link>
            <button
              onClick={() => handleRemoveFavorite(favoriteId)}
              disabled={deleteMutation.isPending}
              className="ml-3 p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50"
              title="お気に入りから削除"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {recipe.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {recipe.description}
            </p>
          )}
          
          <div className="flex items-center space-x-3 text-sm">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              recipe.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
              recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              recipe.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {recipe.difficulty_label || 
               (recipe.difficulty === 'easy' ? '簡単' :
                recipe.difficulty === 'medium' ? '普通' : 
                recipe.difficulty === 'hard' ? '本格派' : '')}
            </span>
            <span className="text-gray-500 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {duration}分
            </span>
          </div>
        </div>
      </div>
    )
  }

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
      <div className="min-h-screen bg-luxury-cream-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="luxury-heading-2 mb-6 flex items-center gap-3">
            <Heart className="w-8 h-8 text-luxury-warm-600" />
            お気に入り
          </h1>
          <Loading variant="luxury" size="lg" text="お気に入りを読み込み中..." />
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
    <div className="min-h-screen bg-luxury-cream-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="luxury-heading-2 mb-4 flex items-center justify-center gap-3">
            <Heart className="w-8 h-8 text-luxury-warm-600" />
            お気に入り
          </h1>
          <p className="luxury-body-large text-luxury-brown-600">
            あなたのお気に入りのレシピと店舗
          </p>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 relative ${
                activeTab === 'recipes'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>レシピ</span>
              </span>
              {activeTab === 'recipes' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 relative ${
                activeTab === 'stores'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>ストア</span>
              </span>
              {activeTab === 'stores' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        {activeTab === 'recipes' ? (
          <div>
            {recipesFavorites.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="max-w-md mx-auto">
                  <svg className="w-24 h-24 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">まだお気に入りのレシピがありません</h3>
                  <p className="text-gray-600 mb-6">気になるレシピを見つけて、ハートマークをタップしてお気に入りに追加しましょう。</p>
                  <Link
                    to="/"
                    className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    レシピを探す
                  </Link>
                </div>
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
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="max-w-md mx-auto">
                  <svg className="w-24 h-24 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">まだお気に入りのストアがありません</h3>
                  <p className="text-gray-600 mb-6">お気に入りの店舗を見つけて登録しましょう。</p>
                  <Link
                    to="/stores"
                    className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    ストアを探す
                  </Link>
                </div>
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

        {/* 削除確認モーダル */}
        <ConfirmationModal
          isOpen={confirmDeleteId !== null}
          onClose={() => setConfirmDeleteId(null)}
          onConfirm={confirmDelete}
          title="お気に入りから削除"
          description="この項目をお気に入りから削除しますか？"
          confirmText="削除"
          cancelText="キャンセル"
          variant="luxury"
          danger={true}
        />
      </div>
    </div>
  )
}

export default FavoritesPage