import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { testYouTubeApi } from './demo/youtubeDemo'
import { SearchInput, VideoGrid } from './components'

function App() {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<unknown>(null)

  const handleTestYouTubeApi = async () => {
    setIsLoading(true)
    try {
      const data = await testYouTubeApi()
      setResults(data)
    } catch (error) {
      console.error('テストエラー:', error)
      setResults({ error: String(error) })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    console.log('検索クエリ:', query)
    // TODO: 実際の検索処理を実装
    setResults({ searchQuery: query, message: '検索機能はまだ実装されていません' })
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Tiramisu App - YouTube API Test</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <br /><br />
        
        <div style={{ marginBottom: '20px' }}>
          <h3>検索コンポーネント</h3>
          <SearchInput 
            onSearch={handleSearch}
            placeholder="YouTube動画を検索..."
            disabled={isLoading}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>VideoGrid コンポーネント デモ</h3>
          <VideoGrid
            videos={[
              {
                videoId: "dQw4w9WgXcQ",
                title: "Rick Astley - Never Gonna Give You Up (Official Video)",
                thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
                duration: "3:33"
              },
              {
                videoId: "9bZkp7q19f0",
                title: "PSY - GANGNAM STYLE (강남스타일) M/V",
                thumbnail: "https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg",
                duration: "4:12"
              },
              {
                videoId: "kJQP7kiw5Fk",
                title: "Luis Fonsi - Despacito ft. Daddy Yankee",
                thumbnail: "https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg",
                duration: "4:41"
              },
              {
                videoId: "JGwWNGJdvx8",
                title: "Ed Sheeran - Shape of You (Official Video)",
                thumbnail: "https://img.youtube.com/vi/JGwWNGJdvx8/maxresdefault.jpg",
                duration: "3:53"
              },
              {
                videoId: "fJ9rUzIMcZQ",
                title: "Queen - Bohemian Rhapsody (Official Video)",
                thumbnail: "https://img.youtube.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg",
                duration: "5:55"
              },
              {
                videoId: "YQHsXMglC9A",
                title: "Adele - Hello (Official Music Video)",
                thumbnail: "https://img.youtube.com/vi/YQHsXMglC9A/maxresdefault.jpg",
                duration: "6:07"
              }
            ]}
            columns={3}
            gap={16}
            maxRows={2}
          />
        </div>
        
        <button 
          onClick={handleTestYouTubeApi} 
          disabled={isLoading}
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          {isLoading ? 'テスト中...' : 'YouTube API テスト実行'}
        </button>
        {results ? (
          <div style={{ marginTop: '20px', textAlign: 'left' }}>
            <h3>結果:</h3>
            <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '300px' }}>
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        ) : null}
      </div>
    </>
  )
}

export default App
