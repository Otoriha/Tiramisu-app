import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useRecipe, useIncrementRecipeView, useRecipes } from '../hooks/useRecipes'
import { useFavorites } from '../hooks/useFavorites'

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const recipeId = parseInt(id || '0', 10)
  const [showShareToast, setShowShareToast] = useState(false)

  // レシピデータを取得
  const { data: recipe, isLoading, error } = useRecipe(recipeId)
  
  // 関連レシピを取得（同じカテゴリーまたは難易度）
  const { data: relatedRecipesResponse } = useRecipes({
    category: recipe?.category,
    difficulty: recipe?.difficulty,
    per_page: 4
  })
  
  // 閲覧数を増加するミューテーション
  const incrementViewMutation = useIncrementRecipeView()
  
  // お気に入り操作
  const { 
    data: favoritesResponse, 
    createMutation, 
    deleteMutation 
  } = useFavorites()
  
  const favorites = favoritesResponse?.data || []
  const isFavorited = favorites.some(
    fav => fav.favoritable_type === 'Recipe' && fav.favoritable_id === recipeId
  )
  const favoriteItem = favorites.find(
    fav => fav.favoritable_type === 'Recipe' && fav.favoritable_id === recipeId
  )
  
  // 関連レシピ（現在のレシピを除外）
  const relatedRecipes = relatedRecipesResponse?.data?.filter(r => r.id !== recipeId).slice(0, 3) || []

  // ページ読み込み時に閲覧数を増加
  useEffect(() => {
    if (recipe && recipeId) {
      incrementViewMutation.mutate(recipeId)
    }
  }, [recipe, recipeId, incrementViewMutation])

  // お気に入りトグル
  const handleFavoriteToggle = () => {
    if (isFavorited && favoriteItem) {
      deleteMutation.mutate(favoriteItem.id)
    } else {
      createMutation.mutate({
        favoritable_type: 'Recipe',
        favoritable_id: recipeId
      })
    }
  }

  // YouTube URLをembed URLに変換
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return ''
    
    // YouTube URL パターンをチェック
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
      /(?:https?:\/\/)?youtu\.be\/([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`
      }
    }
    
    // マッチしない場合はそのまま返す
    return url
  }

  // シェア機能
  const handleShare = async () => {
    const url = window.location.href
    const title = `${recipe?.title} - Tiramisu App`
    
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // ユーザーがキャンセルした場合など
        console.log('Share cancelled')
      }
    } else {
      // Web Share API がサポートされていない場合はクリップボードにコピー
      try {
        await navigator.clipboard.writeText(url)
        setShowShareToast(true)
        setTimeout(() => setShowShareToast(false), 3000)
      } catch (error) {
        console.error('Failed to copy to clipboard:', error)
      }
    }
  }

  if (!id || isNaN(recipeId)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">無効なレシピID</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">レシピが見つかりません</h1>
          <p className="text-gray-600 mb-4">指定されたレシピが存在しないか、エラーが発生しました。</p>
          <div className="space-x-4">
            <button 
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:text-blue-800"
            >
              前のページに戻る
            </button>
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">レシピが見つかりません</h1>
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
        {/* パンくずナビゲーション */}
        <nav className="text-sm text-gray-600 mb-4">
          <Link to="/" className="hover:text-blue-600">ホーム</Link>
          <span className="mx-2">/</span>
          <span>レシピ詳細</span>
        </nav>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* ヘッダー */}
          <div className="p-6 border-b">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {recipe.title}
                </h1>
                <p className="text-gray-600 mb-4">
                  {recipe.description}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className={`px-3 py-1 rounded-full ${
                    recipe.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {recipe.difficulty === 'easy' ? '簡単' :
                     recipe.difficulty === 'medium' ? '普通' : '難しい'}
                  </span>
                  <span>🕒 {recipe.duration}分</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                  title="シェア"
                >
                  📤
                </button>
                <button
                  onClick={handleFavoriteToggle}
                  disabled={createMutation.isPending || deleteMutation.isPending}
                  className={`p-2 rounded-full transition-colors ${
                    isFavorited 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } disabled:opacity-50`}
                  title={isFavorited ? 'お気に入りから削除' : 'お気に入りに追加'}
                >
                  {isFavorited ? '♥' : '♡'}
                </button>
              </div>
            </div>
          </div>

          {/* 動画 */}
          {recipe.video_url && (
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">作り方動画</h2>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src={getYouTubeEmbedUrl(recipe.video_url)}
                  title={`${recipe.title}の作り方`}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* 材料 */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">材料</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          {/* 作り方 */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">作り方</h2>
            <div className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 leading-relaxed pt-1">
                    {instruction}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 関連レシピ */}
        {relatedRecipes.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">関連レシピ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedRecipes.map((relatedRecipe) => (
                <Link
                  key={relatedRecipe.id}
                  to={`/recipes/${relatedRecipe.id}`}
                  className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                    {relatedRecipe.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {relatedRecipe.description}
                  </p>
                  <div className="flex justify-between items-center text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      relatedRecipe.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      relatedRecipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {relatedRecipe.difficulty === 'easy' ? '簡単' :
                       relatedRecipe.difficulty === 'medium' ? '普通' : '難しい'}
                    </span>
                    <div className="flex items-center space-x-2 text-gray-500">
                      <span>🕒 {relatedRecipe.duration}分</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            他のレシピを見る
          </Link>
        </div>

        {/* シェア完了トースト */}
        {showShareToast && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            URLがクリップボードにコピーされました
          </div>
        )}
      </div>
    </div>
  )
}

export default RecipeDetailPage