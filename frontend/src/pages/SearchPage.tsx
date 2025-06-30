import React, { useState, useEffect } from 'react'
import { SearchInput, VideoGrid } from '../components'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/button'
import { Loading } from '../components/ui/Loading'
import useYouTubeSearch from '../hooks/useYouTubeSearch'
import type { VideoCardProps } from '../components/VideoCard'
import { Search, AlertCircle, RefreshCw } from '@/components/icons'

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
    <div className="min-h-screen bg-luxury-cream-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="text-center mb-8">
            <h1 className="luxury-heading-2 mb-4">
              <span className="flex items-center justify-center gap-3">
                <Search className="w-8 h-8 text-luxury-warm-600" />
                TiraLuce Search
              </span>
            </h1>
            <p className="luxury-body-large text-luxury-brown-600">
              YouTubeからティラミスレシピ動画を検索
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <SearchInput
              variant="luxury"
              size="lg"
              onSearch={handleSearch}
              placeholder="ティラミス レシピ、作り方..."
              disabled={isLoading}
              defaultValue={searchQuery}
              animated={true}
            />
          </div>
        </header>

        <main>
          {error && (
            <div className="text-center py-12">
              <Card variant="outlined" className="max-w-md mx-auto border-red-300 bg-red-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-red-800">エラーが発生しました</h3>
                  <p className="text-sm text-red-700 mb-4">{error.message}</p>
                  <Button
                    variant="destructive"
                    onClick={() => refetch()}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    再試行
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12">
              <Loading 
                variant="luxury" 
                size="lg" 
                text={`「${searchQuery}」を検索中...`} 
              />
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {Array.from({ length: 8 }, (_, index) => (
                  <div key={index} className="luxury-skeleton h-48 rounded-xl" />
                ))}
              </div>
            </div>
          )}

          {!isLoading && !error && searchQuery && videoCards.length === 0 && (
            <div className="text-center py-12">
              <Card variant="glass" className="max-w-md mx-auto">
                <CardContent className="p-8">
                  <div className="text-6xl mb-6">🔍</div>
                  <h3 className="luxury-heading-5 mb-4">結果が見つかりません</h3>
                  <p className="luxury-body mb-2">「{searchQuery}」に関する動画が見つかりませんでした。</p>
                  <p className="luxury-body-small text-luxury-brown-500 mb-6">他のキーワードで検索してみてください。</p>
                  <Button
                    variant="luxury"
                    onClick={() => {
                      setSearchQuery('')
                      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
                      searchInput?.focus()
                    }}
                    className="w-full"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    別のキーワードで検索
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {!isLoading && !error && videoCards.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="luxury-heading-4">
                  「{searchQuery}」の検索結果
                </h2>
                <span className="luxury-body-small text-luxury-brown-500 bg-luxury-cream-200 px-3 py-1 rounded-full">
                  {videoCards.length}件の動画
                </span>
              </div>
              <VideoGrid
                videos={videoCards}
                columns={4}
                gap={20}
              />
            </div>
          )}

          {!searchQuery && !isLoading && (
            <div className="text-center py-16">
              <Card variant="luxury" className="max-w-lg mx-auto">
                <CardContent className="p-8">
                  <div className="text-6xl mb-6">🍰</div>
                  <h3 className="luxury-heading-4 mb-4">ティラミスレシピを探しましょう</h3>
                  <p className="luxury-body text-luxury-brown-600 mb-6">
                    上の検索ボックスでYouTube動画を検索してください。<br />
                    「ティラミス 作り方」「簡単 ティラミス」などで検索できます。
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['ティラミス 作り方', '簡単 ティラミス', 'チョコ ティラミス', '抹茶 ティラミス'].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSearch(suggestion)}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default SearchPage