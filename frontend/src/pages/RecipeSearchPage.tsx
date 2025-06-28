import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SearchInput, SearchFilter } from '../components'
import { useRecipes } from '../hooks/useRecipes'
import type { RecipeSearchParams, Recipe } from '../types/api'

const RecipeSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Partial<RecipeSearchParams>>({})
  const [urlParams, setUrlParams] = useState<RecipeSearchParams>({})

  // URL からパラメータを初期化
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const initialParams: RecipeSearchParams = {}
    
    if (params.get('q')) initialParams.q = params.get('q')!
    if (params.get('difficulty')) initialParams.difficulty = params.get('difficulty') as 'easy' | 'medium' | 'hard'
    if (params.get('max_duration')) initialParams.max_duration = Number(params.get('max_duration'))
    if (params.get('category')) initialParams.category = params.get('category')!
    if (params.get('ingredients_include')) {
      initialParams.ingredients_include = params.get('ingredients_include')!.split(',')
    }
    
    setSearchQuery(initialParams.q || '')
    setFilters(initialParams)
    setUrlParams(initialParams)
  }, [])

  // URL を更新
  useEffect(() => {
    const params = new URLSearchParams()
    const allParams = { ...filters, q: searchQuery }
    
    Object.entries(allParams).forEach(([key, value]) => {
      if (value != null && value !== '' && value !== undefined) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(','))
          }
        } else {
          params.set(key, String(value))
        }
      }
    })
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`
    window.history.replaceState({}, '', newUrl)
    setUrlParams({ ...filters, q: searchQuery })
  }, [searchQuery, filters])

  // ドキュメントタイトルを更新
  useEffect(() => {
    if (searchQuery) {
      document.title = `"${searchQuery}" のレシピ検索 - Tiramisu App`
    } else {
      document.title = 'ティラミスレシピ検索 - Tiramisu App'
    }
  }, [searchQuery])

  // レシピを取得
  const { data: recipesResponse, isLoading, error, refetch } = useRecipes({
    ...urlParams,
    per_page: 12
  })

  const recipes = recipesResponse?.data || []
  const totalCount = recipesResponse?.meta?.total || 0

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (newFilters: Partial<RecipeSearchParams>) => {
    setFilters(newFilters)
  }

  const renderRecipeCard = (recipe: Recipe) => (
    <Link
      key={recipe.id}
      to={`/recipes/${recipe.id}`}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
        {recipe.title}
      </h3>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {recipe.description}
      </p>
      <div className="flex justify-between items-center text-sm">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          recipe.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
          recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {recipe.difficulty === 'easy' ? '簡単' :
           recipe.difficulty === 'medium' ? '普通' : '本格派'}
        </span>
        <div className="flex items-center space-x-3 text-gray-500">
          <span>🕒 {recipe.duration}分</span>
        </div>
      </div>
    </Link>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            🍰 ティラミスレシピ検索
          </h1>
          <div className="max-w-2xl mx-auto mb-6">
            <SearchInput
              onSearch={handleSearch}
              placeholder="レシピを検索..."
              disabled={isLoading}
              defaultValue={searchQuery}
            />
          </div>
          
          {/* 検索フィルター */}
          <div className="max-w-4xl mx-auto">
            <SearchFilter
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />
          </div>
        </header>

        <main>
          {/* エラー表示 */}
          {error && (
            <div className="text-center py-12">
              <div className="mb-6 p-6 bg-red-50 border border-red-200 text-red-800 rounded-lg max-w-md mx-auto">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">エラーが発生しました</h3>
                  <p className="text-sm">レシピの読み込み中にエラーが発生しました。</p>
                  {error && (
                    <details className="mt-2 text-xs">
                      <summary className="cursor-pointer">エラー詳細</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-left overflow-auto">
                        {error instanceof Error ? error.message : JSON.stringify(error, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  再試行
                </button>
              </div>
            </div>
          )}

          {/* ローディング表示 */}
          {isLoading && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                検索中...
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }, (_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 検索結果なし */}
          {!isLoading && !error && (searchQuery || Object.keys(filters).length > 0) && recipes.length === 0 && (
            <div className="text-center py-12">
              <div className="mb-4">
                <p className="text-gray-600 text-lg mb-2">
                  条件に一致するレシピが見つかりませんでした。
                </p>
                <p className="text-gray-500 text-sm">
                  検索条件を変更してお試しください。
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilters({})
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                条件をリセット
              </button>
            </div>
          )}

          {/* 検索結果 */}
          {!isLoading && !error && recipes.length > 0 && (searchQuery || Object.keys(filters).length > 0) && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  検索結果 ({totalCount}件)
                </h2>
                {(searchQuery || Object.keys(filters).length > 0) && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setFilters({})
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    条件をクリア
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recipes.map(renderRecipeCard)}
              </div>
            </div>
          )}

          {/* 初期状態でも全レシピを表示 */}
          {!searchQuery && Object.keys(filters).length === 0 && !isLoading && !error && recipes.length > 0 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  すべてのティラミスレシピ ({totalCount}件)
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recipes.map(renderRecipeCard)}
              </div>
            </div>
          )}

          {/* 検索・フィルター案内（レシピがない場合のみ） */}
          {!searchQuery && Object.keys(filters).length === 0 && !isLoading && !error && recipes.length === 0 && (
            <div className="text-center py-12">
              <div className="mb-8">
                <span className="text-6xl mb-4 block">🍰</span>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  ティラミスレシピを探しましょう
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  上の検索ボックスでキーワードを入力するか、<br />
                  詳細検索フィルターを使って条件を指定してください。
                </p>
              </div>
              
              {/* 人気レシピの提案 */}
              <div className="max-w-4xl mx-auto">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  おすすめ検索
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    '簡単ティラミス',
                    'クラシック',
                    'ヴィーガン',
                    '時短レシピ',
                    'マスカルポーネ不使用'
                  ].map((keyword) => (
                    <button
                      key={keyword}
                      onClick={() => setSearchQuery(keyword)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors text-sm"
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default RecipeSearchPage