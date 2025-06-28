import React, { useState, useEffect } from 'react'
import { SearchInput, VideoGrid, SkeletonCard } from '../components'
import useYouTubeSearch from '../hooks/useYouTubeSearch'
import type { VideoCardProps } from '../components/VideoCard'

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [urlQuery, setUrlQuery] = useState('')

  // Initialize search query from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const query = params.get('q') || ''
    setSearchQuery(query)
    setUrlQuery(query)
  }, [])

  // Sync URL when search query changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (searchQuery) {
      params.set('q', searchQuery)
    } else {
      params.delete('q')
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`
    window.history.replaceState({}, '', newUrl)
    setUrlQuery(searchQuery)
  }, [searchQuery])

  // Update document title based on search query
  useEffect(() => {
    if (searchQuery) {
      document.title = `"${searchQuery}" - Tiramisu Search`
    } else {
      document.title = 'Tiramisu Search'
    }
  }, [searchQuery])

  // Use YouTube search hook
  const { data: videos, isLoading, error, refetch } = useYouTubeSearch(urlQuery, {
    enabled: !!urlQuery
  })

  // Convert VideoDetails to VideoCardProps
  const videoCards: VideoCardProps[] = videos?.map(video => ({
    videoId: video.id,
    title: video.title,
    thumbnail: video.thumbnail,
    duration: video.duration
  })) || []

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Tiramisu Search
          </h1>
          <div className="max-w-2xl mx-auto">
            <SearchInput
              onSearch={handleSearch}
              placeholder="YouTube動画を検索..."
              disabled={isLoading}
              defaultValue={searchQuery}
            />
          </div>
        </header>

        <main>
          {error && (
            <div className="text-center py-12">
              <div className="mb-6 p-6 bg-red-50 border border-red-200 text-red-800 rounded-lg max-w-md mx-auto">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">エラーが発生しました</h3>
                  <p className="text-sm">{error.message}</p>
                </div>
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  再試行
                </button>
              </div>
            </div>
          )}

          {isLoading && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                「{searchQuery}」を検索中...
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {Array.from({ length: 6 }, (_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            </div>
          )}

          {!isLoading && !error && searchQuery && videoCards.length === 0 && (
            <div className="text-center py-12">
              <div className="mb-4">
                <p className="text-gray-600 text-lg mb-2">「{searchQuery}」に関する動画が見つかりませんでした。</p>
                <p className="text-gray-500 text-sm">他のキーワードで検索してみてください。</p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('')
                  const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
                  searchInput?.focus()
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                別のキーワードで検索
              </button>
            </div>
          )}

          {!isLoading && !error && videoCards.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                「{searchQuery}」の検索結果
              </h2>
              <VideoGrid
                videos={videoCards}
                columns={4}
                gap={20}
              />
            </div>
          )}

          {!searchQuery && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                上の検索ボックスでYouTube動画を検索してください
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default SearchPage