import React from 'react'
import OptimizedImage from '../components/ui/OptimizedImage'
import { Card, CardContent } from '../components/ui/Card'

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-luxury-cream-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-luxury-cream-100 to-luxury-warm-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-luxury-brown-900 mb-6">
                Italian Artisan
                <span className="block text-3xl lg:text-5xl text-luxury-warm-600 mt-2">
                  Tiramisu
                </span>
              </h1>
              <p className="text-lg text-luxury-brown-700 leading-relaxed mb-8">
                イタリアの伝統的な製法で作られる本格ティラミス。
                熟練職人が一つ一つ丁寧に手作りする、
                まさにイタリアンアルチザンの極上デザートです。
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-luxury-gold-100 px-4 py-2 rounded-full">
                  <span className="text-luxury-gold-800 font-medium">🇮🇹 イタリア伝統製法</span>
                </div>
                <div className="bg-luxury-warm-100 px-4 py-2 rounded-full">
                  <span className="text-luxury-warm-800 font-medium">👨‍🍳 職人手作り</span>
                </div>
                <div className="bg-luxury-cream-200 px-4 py-2 rounded-full">
                  <span className="text-luxury-brown-800 font-medium">🏆 最高品質</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <OptimizedImage
                src="/images/hero/tiramisu-artisan"
                alt="Italian Artisan making Tiramisu"
                width={600}
                height={400}
                priority
                className="rounded-2xl shadow-luxury"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-luxury-brown-900 mb-12">
            私たちの物語
          </h2>
          
          <div className="space-y-12">
            <Card variant="luxury" className="p-8">
              <CardContent>
                <h3 className="text-2xl font-semibold text-luxury-brown-900 mb-4">
                  イタリアからの贈り物
                </h3>
                <p className="text-luxury-brown-700 leading-relaxed mb-6">
                  1960年代、イタリア・ヴェネト州で生まれたティラミス。私たちは現地の老舗パティスリーで修行を積んだ職人により、
                  本場の味をそのままに、日本の皆様にお届けしています。マスカルポーネチーズ、エスプレッソ、
                  レディフィンガーにいたるまで、すべての素材にこだわり抜いています。
                </p>
              </CardContent>
            </Card>

            <Card variant="luxury" className="p-8">
              <CardContent>
                <h3 className="text-2xl font-semibold text-luxury-brown-900 mb-4">
                  職人の技と情熱
                </h3>
                <p className="text-luxury-brown-700 leading-relaxed mb-6">
                  「Pick me up」という意味を持つティラミス。その名の通り、食べる人の心を明るくする魔法のデザートです。
                  私たちの職人は、ひとつひとつのティラミスに愛情を込めて作り上げます。
                  温度管理、混合の技術、熟成時間まで、すべてが完璧に計算されています。
                </p>
              </CardContent>
            </Card>

            <Card variant="luxury" className="p-8">
              <CardContent>
                <h3 className="text-2xl font-semibold text-luxury-brown-900 mb-4">
                  持続可能な未来へ
                </h3>
                <p className="text-luxury-brown-700 leading-relaxed mb-6">
                  美味しいティラミスを未来の世代にも。私たちは環境に配慮した材料調達、
                  パッケージングを心がけています。地域の農家との連携により、
                  新鮮で高品質な素材を安定して確保し、持続可能なビジネスモデルを構築しています。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-luxury-cream-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-luxury-brown-900 mb-12">
            私たちの価値観
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="luxury" className="text-center p-8">
              <CardContent>
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold text-luxury-brown-900 mb-4">
                  アルチザンシップ
                </h3>
                <p className="text-luxury-brown-700">
                  伝統的な技法を守りながら、
                  現代の感性を取り入れた
                  革新的なデザートを創造します。
                </p>
              </CardContent>
            </Card>

            <Card variant="luxury" className="text-center p-8">
              <CardContent>
                <div className="text-4xl mb-4">💎</div>
                <h3 className="text-xl font-semibold text-luxury-brown-900 mb-4">
                  クオリティ
                </h3>
                <p className="text-luxury-brown-700">
                  妥協のない素材選びと
                  厳格な品質管理により、
                  最高のティラミスをお届けします。
                </p>
              </CardContent>
            </Card>

            <Card variant="luxury" className="text-center p-8">
              <CardContent>
                <div className="text-4xl mb-4">❤️</div>
                <h3 className="text-xl font-semibold text-luxury-brown-900 mb-4">
                  情熱
                </h3>
                <p className="text-luxury-brown-700">
                  お客様の笑顔と幸せのために、
                  私たちは情熱を持って
                  毎日ティラミスを作り続けます。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-luxury-brown-900 mb-12">
            Meet Our Team
          </h2>
          
          <Card variant="luxury" className="p-8">
            <CardContent>
              <div className="text-6xl mb-6">👨‍🍳</div>
              <h3 className="text-2xl font-semibold text-luxury-brown-900 mb-4">
                Marco Rossi
              </h3>
              <p className="text-luxury-warm-600 font-medium mb-4">
                Head Pastry Chef & Founder
              </p>
              <p className="text-luxury-brown-700 leading-relaxed">
                イタリア・ミラノ出身。20年以上の経験を持つパティシエ。
                本場イタリアの伝統的なティラミス製法を日本に伝える使命を持って、
                このブランドを立ち上げました。「Dolce vita」の精神で、
                美味しいティラミスを通じて人々に幸せを届けています。
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default About