import React from 'react'
import { useParams } from 'react-router-dom'

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">
          レシピ詳細
        </h1>
        <p className="text-gray-600">
          レシピID: {id}（作成中）
        </p>
      </div>
    </div>
  )
}

export default RecipeDetailPage