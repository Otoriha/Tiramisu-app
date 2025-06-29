import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRecipes } from '../hooks/useRecipes'
import { SearchInput } from '../components/SearchInput'

const HomePage: React.FC = () => {
  const navigate = useNavigate()

  // 人気レシピを取得（最初の6件）
  const { data: recipesResponse, isLoading: recipesLoading, error: recipesError } = useRecipes({
    per_page: 6
  })

  const recipes = recipesResponse?.data || []

  // レシピ検索ハンドラー
  const handleRecipeSearch = (query: string) => {
    navigate(`/recipes?q=${encodeURIComponent(query)}`)
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
              <div>
                <Link
                  to="/stores"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🗺️ マップで探す
                </Link>
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
                    {recipe.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {recipe.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded ${
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
                    <span>🕒 {recipe.duration}分</span>
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

          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">
              お近くのティラミスが楽しめるお店を探してみませんか？
            </p>
            <Link 
              to="/stores" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="mr-2">📍</span>
              マップで探す
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default HomePage