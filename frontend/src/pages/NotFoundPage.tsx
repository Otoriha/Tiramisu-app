import React from 'react'
import { Link } from 'react-router-dom'

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">
          ページが見つかりません
        </h2>
        <p className="text-gray-500 mb-8">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage