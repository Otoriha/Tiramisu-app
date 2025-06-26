import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { testYouTubeApi } from './demo/youtubeDemo'

function App() {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

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
        <button 
          onClick={handleTestYouTubeApi} 
          disabled={isLoading}
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          {isLoading ? 'テスト中...' : 'YouTube API テスト実行'}
        </button>
        {results && (
          <div style={{ marginTop: '20px', textAlign: 'left' }}>
            <h3>結果:</h3>
            <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '300px' }}>
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </>
  )
}

export default App
