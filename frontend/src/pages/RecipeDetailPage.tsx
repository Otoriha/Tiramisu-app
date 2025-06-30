import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useRecipe, useIncrementRecipeView, useRecipes } from '../hooks/useRecipes'
import { useFavorites } from '../hooks/useFavorites'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/button'
import { 
  Clock, 
  Users, 
  ChefHat, 
  Heart, 
  Share2, 
  PlayCircle, 
  ArrowLeft,
  CheckCircle,
} from '@/components/icons'

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
    deleteMutation,
    isLoading: _favoritesLoading,
    error: _favoritesError
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
  }, [recipeId])

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
    
    return url
  }

  // シェア機能
  const handleShare = async () => {
    const url = window.location.href
    const title = `${recipe?.title} - TiraLuce`
    
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        console.log('Share cancelled')
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setShowShareToast(true)
        setTimeout(() => setShowShareToast(false), 3000)
      } catch (error) {
        console.error('Failed to copy to clipboard:', error)
      }
    }
  }

  // 難易度に応じたスタイリング
  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return {
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: '🟢',
          label: '簡単'
        }
      case 'medium':
        return {
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          icon: '🟡',
          label: '普通'
        }
      case 'hard':
        return {
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: '🔴',
          label: '本格派'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: '⚪',
          label: '不明'
        }
    }
  }

  if (!id || isNaN(recipeId)) {
    return (
      <div className="min-h-screen bg-luxury-cream-50 flex items-center justify-center">
        <Card variant="luxury" className="p-8 text-center max-w-md">
          <CardContent>
            <h1 className="text-2xl font-bold text-luxury-brown-900 mb-4">無効なレシピID</h1>
            <Link to="/">
              <Button variant="luxury">ホームに戻る</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-cream-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-luxury-cream-200 rounded w-1/3"></div>
            <Card variant="luxury" className="p-8">
              <div className="h-8 bg-luxury-cream-200 rounded mb-4"></div>
              <div className="h-4 bg-luxury-cream-200 rounded mb-2"></div>
              <div className="h-4 bg-luxury-cream-200 rounded w-3/4 mb-6"></div>
              <div className="aspect-video bg-luxury-cream-200 rounded-xl"></div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-luxury-cream-50 flex items-center justify-center">
        <Card variant="luxury" className="p-8 text-center max-w-md">
          <CardContent>
            <h1 className="text-2xl font-bold text-luxury-brown-900 mb-4">レシピが見つかりません</h1>
            <p className="text-luxury-brown-600 mb-6">指定されたレシピが存在しないか、エラーが発生しました。</p>
            <div className="space-y-3">
              <Button 
                variant="outline"
                onClick={() => navigate(-1)}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                前のページに戻る
              </Button>
              <Link to="/" className="block">
                <Button variant="luxury" className="w-full">
                  ホームに戻る
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const difficultyConfig = getDifficultyConfig(recipe.difficulty)

  return (
    <div className="min-h-screen bg-luxury-cream-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* パンくずナビゲーション */}
        <nav className="flex items-center text-sm text-luxury-brown-600 mb-6">
          <Link to="/" className="hover:text-luxury-warm-600 transition-colors">
            TiraLuce
          </Link>
          <span className="mx-2">/</span>
          <Link to="/recipes" className="hover:text-luxury-warm-600 transition-colors">
            レシピ
          </Link>
          <span className="mx-2">/</span>
          <span className="text-luxury-brown-800 font-medium truncate max-w-xs">
            {recipe.title}
          </span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-6">
            {/* レシピヘッダー */}
            <Card variant="luxury" className="overflow-hidden">
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h1 className="text-3xl lg:text-4xl font-bold text-luxury-brown-900 mb-4 leading-tight">
                      {recipe.title}
                    </h1>
                    <p className="text-lg text-luxury-brown-600 leading-relaxed">
                      {recipe.description}
                    </p>
                  </div>
                  
                  {/* アクションボタン */}
                  <div className="flex items-center space-x-3 ml-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      シェア
                    </Button>
                    <Button
                      variant={isFavorited ? "luxury" : "outline"}
                      size="sm"
                      onClick={handleFavoriteToggle}
                      disabled={createMutation.isPending || deleteMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                      {isFavorited ? 'お気に入り済み' : 'お気に入り'}
                    </Button>
                  </div>
                </div>

                {/* レシピ統計 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-luxury-cream-100 rounded-xl">
                    <Clock className="w-6 h-6 text-luxury-warm-600 mx-auto mb-2" />
                    <div className="text-sm text-luxury-brown-600">所要時間</div>
                    <div className="font-semibold text-luxury-brown-900">{recipe.duration}分</div>
                  </div>
                  
                  <div className="text-center p-4 bg-luxury-cream-100 rounded-xl">
                    <div className="text-2xl mb-2">{difficultyConfig.icon}</div>
                    <div className="text-sm text-luxury-brown-600">難易度</div>
                    <div className="font-semibold text-luxury-brown-900">{difficultyConfig.label}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-luxury-cream-100 rounded-xl">
                    <PlayCircle className="w-6 h-6 text-luxury-warm-600 mx-auto mb-2" />
                    <div className="text-sm text-luxury-brown-600">視聴回数</div>
                    <div className="font-semibold text-luxury-brown-900">{recipe.view_count.toLocaleString()}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-luxury-cream-100 rounded-xl">
                    <ChefHat className="w-6 h-6 text-luxury-warm-600 mx-auto mb-2" />
                    <div className="text-sm text-luxury-brown-600">カテゴリ</div>
                    <div className="font-semibold text-luxury-brown-900">{recipe.category_label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* YouTube動画 */}
            {recipe.video_url && (
              <Card variant="luxury">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-luxury-brown-900 mb-4 flex items-center gap-2">
                    <PlayCircle className="w-6 h-6 text-luxury-warm-600" />
                    作り方動画
                  </h2>
                  <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                    <iframe
                      src={getYouTubeEmbedUrl(recipe.video_url)}
                      title={`${recipe.title}の作り方`}
                      className="w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 作り方手順 */}
            <Card variant="luxury">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-luxury-brown-900 mb-6 flex items-center gap-2">
                  <ChefHat className="w-6 h-6 text-luxury-warm-600" />
                  作り方
                </h2>
                <div className="space-y-6">
                  {recipe.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-luxury-warm-500 text-white rounded-full flex items-center justify-center font-semibold shadow-md">
                        {index + 1}
                      </div>
                      <div className="flex-1 pt-2">
                        <p className="text-luxury-brown-700 leading-relaxed">
                          {instruction}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 材料リスト */}
            <Card variant="luxury" className="sticky top-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-luxury-brown-900 mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-luxury-warm-600" />
                  材料
                </h2>
                {recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-center gap-3 p-3 bg-luxury-cream-100 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-luxury-warm-600 flex-shrink-0" />
                        <span className="text-luxury-brown-700">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-luxury-brown-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>材料情報が登録されていません</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 関連レシピ */}
        {relatedRecipes.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-luxury-brown-900 mb-6">関連レシピ</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedRecipes.map((relatedRecipe) => (
                <Link
                  key={relatedRecipe.id}
                  to={`/recipes/${relatedRecipe.id}`}
                  className="group"
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-luxury-brown-900 mb-2 line-clamp-2 group-hover:text-luxury-warm-600 transition-colors">
                        {relatedRecipe.title}
                      </h3>
                      <p className="text-luxury-brown-600 text-sm mb-4 line-clamp-2">
                        {relatedRecipe.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyConfig(relatedRecipe.difficulty).color}`}>
                          {getDifficultyConfig(relatedRecipe.difficulty).label}
                        </span>
                        <div className="flex items-center text-luxury-brown-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {relatedRecipe.duration}分
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="mt-12 text-center">
          <Link to="/recipes">
            <Button variant="luxury" size="lg" className="mr-4">
              他のレシピを見る
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="lg">
              ホームに戻る
            </Button>
          </Link>
        </div>

        {/* シェア完了トースト */}
        {showShareToast && (
          <div className="fixed bottom-6 right-6 bg-luxury-warm-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            URLがクリップボードにコピーされました
          </div>
        )}
      </div>
    </div>
  )
}

export default RecipeDetailPage