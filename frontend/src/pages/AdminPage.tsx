import React, { useState } from 'react'
import { recipeImportService } from '../services/recipeImportService'

const AdminPage: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const [maxResults, setMaxResults] = useState(30)

  const handleImportRecipes = async () => {
    if (isImporting) return

    setIsImporting(true)
    setImportResult(null)

    try {
      const result = await recipeImportService.collectAndImportTiramisuRecipes(maxResults)
      setImportResult(result)
    } catch (error) {
      setImportResult({
        success: false,
        created_count: 0,
        total_count: 0,
        errors: [error instanceof Error ? error.message : 'エラーが発生しました']
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">レシピ管理画面</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">YouTube からレシピデータを収集</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最大取得件数
            </label>
            <input
              type="number"
              value={maxResults}
              onChange={(e) => setMaxResults(parseInt(e.target.value) || 30)}
              min="10"
              max="100"
              className="border border-gray-300 rounded-md px-3 py-2 w-32"
              disabled={isImporting}
            />
          </div>

          <button
            onClick={handleImportRecipes}
            disabled={isImporting}
            className={`px-6 py-3 rounded-lg font-medium ${
              isImporting
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isImporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                収集中...
              </>
            ) : (
              'レシピデータを収集'
            )}
          </button>

          {isImporting && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <svg className="animate-spin h-5 w-5 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div className="text-blue-800">
                  <p className="font-medium">YouTube からティラミスレシピを収集中...</p>
                  <p className="text-sm">この処理には数分かかる場合があります。</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {importResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">インポート結果</h3>
            
            <div className={`p-4 rounded-lg mb-4 ${
              importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`${importResult.success ? 'text-green-800' : 'text-red-800'}`}>
                <p className="font-medium">
                  {importResult.success ? '✅ インポート完了' : '❌ インポート失敗'}
                </p>
                <p className="text-sm mt-1">
                  {importResult.created_count} / {importResult.total_count} 件のレシピを保存しました
                </p>
              </div>
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-2">エラー:</h4>
                <ul className="space-y-1">
                  {importResult.errors.map((error: string, index: number) => (
                    <li key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {importResult.data && importResult.data.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-2">追加されたレシピ:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {importResult.data.map((recipe: any, index: number) => (
                    <div key={index} className="text-sm bg-gray-50 p-3 rounded">
                      <p className="font-medium">{recipe.title}</p>
                      <p className="text-gray-600">{recipe.description}</p>
                      <div className="flex gap-2 mt-1">
                        <span className={`px-2 py-1 rounded text-xs ${
                          recipe.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {recipe.difficulty === 'easy' ? '簡単' :
                           recipe.difficulty === 'medium' ? '普通' : '本格派'}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {recipe.duration}分
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <a
            href="/recipes"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            レシピ一覧を確認
          </a>
        </div>
      </div>
    </div>
  )
}

export default AdminPage