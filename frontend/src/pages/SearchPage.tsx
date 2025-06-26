import React, { useState, useEffect } from 'react'
import { SearchInput, VideoGrid } from '../components'
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
  const { data: videos, isLoading, error } = useYouTubeSearch(urlQuery, {
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
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              エラーが発生しました: {error.message}
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">検索中...</p>
            </div>
          )}

          {!isLoading && !error && searchQuery && videoCards.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">「{searchQuery}」に関する動画が見つかりませんでした。</p>
            </div>
          )}

          {!isLoading && !error && videoCards.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                「{searchQuery}」の検索結果 ({videoCards.length}件)
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