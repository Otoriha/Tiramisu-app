import React, { useState } from 'react'
import type { RecipeSearchParams } from '../types/api'

export interface SearchFilterProps {
  onFilterChange: (filters: Partial<RecipeSearchParams>) => void
  initialFilters?: Partial<RecipeSearchParams>
  className?: string
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  onFilterChange,
  initialFilters = {},
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<Partial<RecipeSearchParams>>(initialFilters)

  const handleFilterChange = (key: keyof RecipeSearchParams, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleResetFilters = () => {
    const resetFilters: Partial<RecipeSearchParams> = {}
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  const hasActiveFilters = Object.keys(filters).some(key => 
    key !== 'q' && key !== 'page' && key !== 'per_page' && filters[key as keyof RecipeSearchParams] != null
  )

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* フィルターヘッダー */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-800">🔍 詳細検索</h3>
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                フィルター適用中
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                リセット
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              {isExpanded ? '閉じる' : '開く'}
            </button>
          </div>
        </div>
      </div>

      {/* フィルターコンテンツ */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* 難易度フィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              難易度
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: undefined, label: 'すべて' },
                { value: 'easy', label: '簡単' },
                { value: 'medium', label: '普通' },
                { value: 'hard', label: '本格派' }
              ].map(({ value, label }) => (
                <button
                  key={label}
                  onClick={() => handleFilterChange('difficulty', value)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.difficulty === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 調理時間フィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              調理時間
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: undefined, label: 'すべて' },
                { value: 30, label: '30分以内' },
                { value: 60, label: '1時間以内' },
                { value: 120, label: '2時間以内' }
              ].map(({ value, label }) => (
                <button
                  key={label}
                  onClick={() => handleFilterChange('cooking_time_max', value)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.cooking_time_max === value
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* カテゴリーフィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリー
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: undefined, label: 'すべて' },
                { value: 'classic', label: 'クラシック' },
                { value: 'modern', label: 'モダンアレンジ' },
                { value: 'vegan', label: 'ヴィーガン' },
                { value: 'quick', label: '時短レシピ' }
              ].map(({ value, label }) => (
                <button
                  key={label}
                  onClick={() => handleFilterChange('category', value)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.category === value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 材料フィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              特定材料
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'mascarpone', label: 'マスカルポーネ' },
                  { value: 'coffee', label: 'エスプレッソ' },
                  { value: 'ladyfinger', label: 'サヴォイアルディ' },
                  { value: 'no-alcohol', label: 'ノンアルコール' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => {
                      const currentInclude = filters.ingredients_include || []
                      const isSelected = currentInclude.includes(value)
                      const newInclude = isSelected
                        ? currentInclude.filter(item => item !== value)
                        : [...currentInclude, value]
                      handleFilterChange('ingredients_include', newInclude.length > 0 ? newInclude : undefined)
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      (filters.ingredients_include || []).includes(value)
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchFilter