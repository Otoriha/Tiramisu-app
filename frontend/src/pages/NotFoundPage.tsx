import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/button'
import { Home, Search } from 'lucide-react'

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-luxury-cream-50 flex items-center justify-center px-4">
      <Card variant="luxury" className="max-w-md w-full text-center" hoverable>
        <CardContent className="p-8">
          <div className="text-8xl mb-6">🍰</div>
          <h1 className="text-6xl font-bold text-luxury-brown-900 mb-4">404</h1>
          <h2 className="luxury-heading-4 text-luxury-brown-700 mb-4">
            ページが見つかりません
          </h2>
          <p className="luxury-body text-luxury-brown-600 mb-8">
            お探しのページは存在しないか、移動した可能性があります。<br />
            美味しいティラミスを探しに戻りましょう。
          </p>
          <div className="space-y-3">
            <Link to="/" className="block">
              <Button variant="luxury" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                ホームに戻る
              </Button>
            </Link>
            <Link to="/search" className="block">
              <Button variant="outline" className="w-full">
                <Search className="w-4 h-4 mr-2" />
                レシピを探す
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotFoundPage