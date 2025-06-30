import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRecipes } from '../hooks/useRecipes'
import HeroSection from '../components/ui/HeroSection'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/button'
import { SearchInput } from '../components/SearchInput'
import { Clock, MapPin, PlayCircle, ChefHat, Star, TrendingUp } from '@/components/icons'

const HomePage: React.FC = () => {
  const navigate = useNavigate()

  // 人気レシピを取得（最初の6件）
  const { data: recipesResponse, isLoading: recipesLoading, error: recipesError } = useRecipes({
    per_page: 6
  })

  const recipes = recipesResponse?.data || []

  // レシピ検索ハンドラー
  const handleRecipeSearch = (query: string) => {
    navigate(`/recipes?q=${encodeURIComponent(query)}`)
  }

  // サービスの特徴データ
  const features = [
    {
      icon: <PlayCircle className="w-8 h-8" />,
      title: '動画レシピ',
      description: 'YouTubeから厳選したティラミスレシピ動画を一覧で'
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: '店舗マップ',
      description: '現在地から近いティラミスの名店を簡単検索'
    },
    {
      icon: <ChefHat className="w-8 h-8" />,
      title: 'プロのレシピ',
      description: '初心者からプロまで、難易度別レシピを収録'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: '最新トレンド',
      description: '話題のティラミスレシピを毎日更新'
    }
  ]

  // 最新動画レシピ（仮データ）
  const videoRecipes = [
    {
      id: 1,
      title: '本格イタリアンティラミスの作り方',
      thumbnail: '/images/video-thumb-1.jpg',
      duration: '12:34',
      channel: 'Italian Cooking',
      views: '15K'
    },
    {
      id: 2,
      title: '5分で作れる！簡単ティラミスカップ',
      thumbnail: '/images/video-thumb-2.jpg',
      duration: '5:20',
      channel: '時短スイーツ',
      views: '8.2K'
    },
    {
      id: 3,
      title: '抹茶ティラミスの新レシピ',
      thumbnail: '/images/video-thumb-3.jpg',
      duration: '8:45',
      channel: '和スイーツLab',
      views: '3.5K'
    }
  ]

  return (
    <div className="min-h-screen bg-luxury-cream-50">
      {/* Hero Section */}
      <HeroSection
        title="ティラミスの世界へようこそ"
        subtitle="TiraLuce - Find Your Perfect Tiramisu"
        description="YouTubeレシピから近くの名店まで、すべてのティラミス情報をここに"
        primaryAction={{
          text: 'レシピを探す',
          onClick: () => navigate('/recipes')
        }}
        secondaryAction={{
          text: '店舗を探す',
          onClick: () => navigate('/stores')
        }}
        backgroundImage="/images/hero/tiramisu-hero"
        overlayOpacity={0.6}
      />

      {/* Search Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="max-w-6xl mx-auto">
          <Card variant="luxury" className="shadow-2xl p-8">
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                {/* レシピ検索 */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-luxury-warm-100 rounded-full mb-4">
                    <PlayCircle className="w-8 h-8 text-luxury-warm-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-luxury-brown-900 mb-4">レシピを探す</h3>
                  <p className="text-luxury-brown-600 mb-6">
                    お家で簡単に作れるレシピから<br />
                    本格的なプロレシピまで
                  </p>
                  <SearchInput 
                    onSearch={handleRecipeSearch}
                    placeholder="レシピを検索..."
                    className="max-w-md mx-auto"
                  />
                </div>

                {/* ストア検索 */}
                <div className="text-center border-t md:border-t-0 md:border-l border-luxury-cream-300 pt-8 md:pt-0">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-luxury-gold-100 rounded-full mb-4">
                    <MapPin className="w-8 h-8 text-luxury-gold-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-luxury-brown-900 mb-4">専門店を探す</h3>
                  <p className="text-luxury-brown-600 mb-6">
                    あなたの近くのティラミス専門店や<br />
                    おすすめカフェを見つけよう
                  </p>
                  <Button
                    variant="luxury"
                    size="lg"
                    onClick={() => navigate('/stores')}
                    className="min-w-[200px]"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    マップで探す
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Service Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-luxury-brown-900 mb-4">
              TiraLuceの特徴
            </h2>
            <p className="text-lg text-luxury-brown-600 max-w-2xl mx-auto">
              ティラミスに特化した情報プラットフォーム
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-luxury-cream-100 text-luxury-warm-600 rounded-full mb-4 group-hover:bg-luxury-warm-100 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-luxury-brown-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-luxury-brown-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Video Recipes */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-luxury-cream-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-luxury-brown-900 mb-2">最新の動画レシピ</h2>
              <p className="text-luxury-brown-600">YouTubeから厳選した人気レシピ</p>
            </div>
            <Link to="/search">
              <Button variant="outline">
                すべて見る →
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {videoRecipes.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative aspect-video bg-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-white opacity-80" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {video.duration}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-luxury-brown-900 mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <div className="flex justify-between items-center text-sm text-luxury-brown-600">
                    <span>{video.channel}</span>
                    <span>{video.views} views</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Recipes Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-luxury-brown-900 mb-2">人気のレシピ</h2>
              <p className="text-luxury-brown-600">みんなが作っている定番レシピ</p>
            </div>
            <Link to="/recipes">
              <Button variant="outline">
                すべて見る →
              </Button>
            </Link>
          </div>

          {recipesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} variant="luxury" className="p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-luxury-cream-200 rounded mb-4"></div>
                    <div className="h-4 bg-luxury-cream-200 rounded mb-2"></div>
                    <div className="h-4 bg-luxury-cream-200 rounded w-3/4"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : recipesError ? (
            <div className="text-center py-8 text-red-600">
              レシピの読み込み中にエラーが発生しました
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <Link 
                  key={recipe.id} 
                  to={`/recipes/${recipe.id}`}
                  className="group"
                >
                  <Card variant="luxury" className="h-full hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-luxury-brown-900 group-hover:text-luxury-warm-600 transition-colors">
                          {recipe.title}
                        </h3>
                        <div className="flex items-center text-sm text-luxury-brown-500">
                          <PlayCircle className="w-4 h-4 mr-1" />
                          {recipe.view_count.toLocaleString()}
                        </div>
                      </div>
                      
                      <p className="text-luxury-brown-600 text-sm mb-4 line-clamp-2">
                        {recipe.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          recipe.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          recipe.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {recipe.difficulty_label || 
                           (recipe.difficulty === 'easy' ? '簡単' :
                            recipe.difficulty === 'medium' ? '普通' : 
                            recipe.difficulty === 'hard' ? '本格派' : '')}
                        </span>
                        <div className="flex items-center text-luxury-brown-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {recipe.duration}分
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Store Map Preview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-luxury-warm-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-luxury-brown-900 mb-6">
                お近くのティラミス専門店
              </h2>
              <p className="text-lg text-luxury-brown-700 mb-6 leading-relaxed">
                全国のティラミスが楽しめるカフェや専門店を簡単検索。
                現在地から最寄りの店舗を見つけて、本格的なティラミスを堪能しましょう。
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-luxury-gold-100 rounded-full flex items-center justify-center mr-4">
                    <MapPin className="w-6 h-6 text-luxury-gold-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-luxury-brown-900">現在地から検索</h4>
                    <p className="text-sm text-luxury-brown-600">GPSで最寄りの店舗を自動表示</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-luxury-warm-100 rounded-full flex items-center justify-center mr-4">
                    <Star className="w-6 h-6 text-luxury-warm-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-luxury-brown-900">レビュー評価付き</h4>
                    <p className="text-sm text-luxury-brown-600">実際の口コミで安心選択</p>
                  </div>
                </div>
              </div>
              <Button 
                variant="luxury" 
                size="lg"
                onClick={() => navigate('/stores')}
                className="group"
              >
                <MapPin className="w-5 h-5 mr-2" />
                地図で店舗を探す
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Button>
            </div>
            
            <div className="relative h-[400px] bg-luxury-cream-200 rounded-2xl overflow-hidden shadow-luxury">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-luxury-warm-500 mx-auto mb-4" />
                  <p className="text-luxury-brown-600">地図プレビュー</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-luxury-brown-800 to-luxury-brown-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            ティラミスの新しい世界を発見しよう
          </h2>
          <p className="text-xl text-white/90 mb-8">
            作る楽しみ、食べる喜び。すべてがここに。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              variant="default"
              className="bg-white text-luxury-brown-800 hover:bg-luxury-cream-100"
              onClick={() => navigate('/recipes')}
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              レシピを探す
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              onClick={() => navigate('/stores')}
            >
              <MapPin className="w-5 h-5 mr-2" />
              お店を探す
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage