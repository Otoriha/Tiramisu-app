import React, { useState } from 'react'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: フォーム送信ロジックを実装
    console.log('Contact form submitted:', formData)
    alert('お問い合わせありがとうございます。後日ご連絡いたします。')
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-luxury-cream-50">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-luxury-cream-100 to-luxury-warm-100">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-luxury-brown-900 mb-6">
            Contact Us
          </h1>
          <p className="text-lg text-luxury-brown-700 leading-relaxed">
            ご質問、ご相談、特別なご注文など、
            お気軽にお問い合わせください。
          </p>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card variant="luxury" className="p-8">
                <CardContent>
                  <h2 className="text-2xl font-semibold text-luxury-brown-900 mb-6">
                    お問い合わせフォーム
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-luxury-brown-800 mb-2">
                        お名前 *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full"
                        placeholder="山田太郎"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-luxury-brown-800 mb-2">
                        メールアドレス *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full"
                        placeholder="example@email.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-luxury-brown-800 mb-2">
                        件名 *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full"
                        placeholder="お問い合わせの件名を入力してください"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-luxury-brown-800 mb-2">
                        メッセージ *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-luxury-cream-300 rounded-lg focus:ring-2 focus:ring-luxury-warm-500 focus:border-luxury-warm-500 transition-colors resize-none"
                        placeholder="お問い合わせ内容を詳しくお聞かせください..."
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="luxury"
                      size="lg"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      送信する
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Store Information */}
              <Card variant="luxury" className="p-8">
                <CardContent>
                  <h2 className="text-2xl font-semibold text-luxury-brown-900 mb-6">
                    店舗情報
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-6 h-6 text-luxury-warm-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-luxury-brown-900">住所</h3>
                        <p className="text-luxury-brown-700 mt-1">
                          〒150-0001<br />
                          東京都渋谷区神宮前3-25-18<br />
                          ティラミス・アルチザン 表参道本店
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Phone className="w-6 h-6 text-luxury-warm-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-luxury-brown-900">電話番号</h3>
                        <p className="text-luxury-brown-700 mt-1">03-1234-5678</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Mail className="w-6 h-6 text-luxury-warm-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-luxury-brown-900">メール</h3>
                        <p className="text-luxury-brown-700 mt-1">info@tiramisu-artisan.jp</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Clock className="w-6 h-6 text-luxury-warm-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-luxury-brown-900">営業時間</h3>
                        <div className="text-luxury-brown-700 mt-1 space-y-1">
                          <p>平日: 10:00 - 20:00</p>
                          <p>土日祝: 9:00 - 21:00</p>
                          <p className="text-sm text-luxury-brown-600">定休日: 毎月第3月曜日</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card variant="luxury" className="p-8">
                <CardContent>
                  <h2 className="text-2xl font-semibold text-luxury-brown-900 mb-6">
                    よくあるご質問
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-luxury-brown-900 mb-2">
                        Q. 配送は可能ですか？
                      </h3>
                      <p className="text-luxury-brown-700 text-sm">
                        A. はい、冷蔵配送にて全国にお届けしています。配送料は地域により異なります。
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-luxury-brown-900 mb-2">
                        Q. 賞味期限はどれくらいですか？
                      </h3>
                      <p className="text-luxury-brown-700 text-sm">
                        A. 製造日より冷蔵保存で3日間です。なるべくお早めにお召し上がりください。
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-luxury-brown-900 mb-2">
                        Q. アレルギー対応はありますか？
                      </h3>
                      <p className="text-luxury-brown-700 text-sm">
                        A. 卵、乳、小麦を使用しています。詳細はお電話でお問い合わせください。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card variant="luxury" className="p-8">
                <CardContent>
                  <h2 className="text-2xl font-semibold text-luxury-brown-900 mb-6">
                    SNSでも情報発信中
                  </h2>
                  
                  <div className="flex gap-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      Instagram
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Facebook
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Twitter
                    </Button>
                  </div>
                  
                  <p className="text-luxury-brown-600 text-sm mt-4">
                    最新の商品情報や季節限定メニューをいち早くお届けします。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact