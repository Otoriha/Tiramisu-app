# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts "🍰 Creating tiramisu recipes..."

# Sample recipes
recipes = [
  {
    title: "クラシックティラミス",
    description: "マスカルポーネチーズとエスプレッソを使った本格的なイタリアンティラミス",
    thumbnail_url: "https://example.com/classic-tiramisu.jpg",
    video_url: "https://youtube.com/watch?v=example1",
    duration: 30,
    difficulty: "medium",
    category: "classic",
    ingredients: [
      "マスカルポーネチーズ 250g",
      "卵黄 3個",
      "砂糖 60g",
      "エスプレッソ 200ml",
      "ラディサボイアルディ 200g",
      "ココアパウダー 適量"
    ],
    instructions: [
      "卵黄と砂糖を湯煎で混ぜる",
      "マスカルポーネを加えてなめらかにする",
      "エスプレッソにラディサボイアルディを浸す",
      "容器に層を作る",
      "冷蔵庫で4時間冷やす",
      "ココアパウダーをふりかける"
    ],
    source_type: "youtube",
    source_id: "abc123",
    published_at: 1.month.ago,
    view_count: 1500
  },
  {
    title: "簡単ティラミス - 15分で作れる！",
    description: "忙しい方でも簡単に作れるクイックティラミスレシピ",
    thumbnail_url: "https://example.com/quick-tiramisu.jpg",
    video_url: "https://youtube.com/watch?v=example2",
    duration: 15,
    difficulty: "easy",
    category: "quick",
    ingredients: [
      "クリームチーズ 200g",
      "生クリーム 200ml",
      "砂糖 50g",
      "インスタントコーヒー 大さじ2",
      "ビスケット 100g",
      "ココアパウダー 適量"
    ],
    instructions: [
      "クリームチーズを柔らかくする",
      "生クリームと砂糖を泡立てる",
      "インスタントコーヒーを溶かす",
      "ビスケットをコーヒーに浸す",
      "層を作って冷やす"
    ],
    source_type: "youtube",
    source_id: "def456",
    published_at: 2.weeks.ago,
    view_count: 3200
  },
  {
    title: "ヴィーガンティラミス",
    description: "植物性材料だけで作る、ヘルシーで美味しいティラミス",
    thumbnail_url: "https://example.com/vegan-tiramisu.jpg",
    video_url: "https://youtube.com/watch?v=example3",
    duration: 45,
    difficulty: "medium",
    category: "vegan",
    ingredients: [
      "カシューナッツ 200g",
      "ココナッツクリーム 400ml",
      "メープルシロップ 80ml",
      "コーヒー 200ml",
      "ビーガンビスケット 150g",
      "カカオパウダー 適量"
    ],
    instructions: [
      "カシューナッツを一晩浸水",
      "ナッツとココナッツクリームをブレンド",
      "メープルシロップで甘みを調整",
      "コーヒーにビスケットを浸す",
      "層を作って冷やす",
      "カカオパウダーで仕上げ"
    ],
    source_type: "youtube",
    source_id: "ghi789",
    published_at: 1.week.ago,
    view_count: 890
  }
]

recipes.each do |recipe_data|
  Recipe.find_or_create_by!(source_id: recipe_data[:source_id], source_type: recipe_data[:source_type]) do |recipe|
    recipe.assign_attributes(recipe_data)
  end
end

puts "✅ Created #{Recipe.count} recipes"

puts "\n🏪 Creating tiramisu stores..."

# Sample stores (Tokyo area)
stores = [
  {
    name: "ティラミス専門店 HERO",
    address: "東京都渋谷区神宮前4-28-26",
    latitude: 35.6685,
    longitude: 139.7073,
    phone_number: "03-1234-5678",
    website_url: "https://tiramisu-hero.com",
    opening_hours: "11:00-20:00",
    google_place_id: "ChIJN1t_example1",
    rating: 4.5,
    review_count: 234,
    price_level: 2
  },
  {
    name: "イタリアンカフェ ドルチェ",
    address: "東京都新宿区新宿3-14-1",
    latitude: 35.6896,
    longitude: 139.7006,
    phone_number: "03-2345-6789",
    website_url: "https://dolce-cafe.jp",
    opening_hours: "10:00-22:00",
    google_place_id: "ChIJN1t_example2",
    rating: 4.2,
    review_count: 156,
    price_level: 3
  },
  {
    name: "パティスリー ティラミス",
    address: "東京都港区南青山5-10-1",
    latitude: 35.6654,
    longitude: 139.7135,
    phone_number: "03-3456-7890",
    website_url: "https://patisserie-tiramisu.com",
    opening_hours: "10:00-19:00",
    google_place_id: "ChIJN1t_example3",
    rating: 4.8,
    review_count: 412,
    price_level: 4
  },
  {
    name: "カフェ・ティラミス",
    address: "東京都中央区銀座6-10-1",
    latitude: 35.6695,
    longitude: 139.7631,
    phone_number: "03-4567-8901",
    opening_hours: "11:00-21:00",
    google_place_id: "ChIJN1t_example4",
    rating: 4.0,
    review_count: 89,
    price_level: 2
  }
]

stores.each do |store_data|
  Store.find_or_create_by!(google_place_id: store_data[:google_place_id]) do |store|
    store.assign_attributes(store_data)
  end
end

puts "✅ Created #{Store.count} stores"

# Sample favorites
puts "\n❤️  Creating sample favorites..."

user_ids = ["user_001", "user_002", "user_003"]

user_ids.each do |user_id|
  # Each user favorites some recipes
  Recipe.limit(2).order("RANDOM()").each do |recipe|
    Favorite.find_or_create_by!(
      user_identifier: user_id,
      favoritable: recipe
    )
  end

  # Each user favorites some stores
  Store.limit(1).order("RANDOM()").each do |store|
    Favorite.find_or_create_by!(
      user_identifier: user_id,
      favoritable: store
    )
  end
end

puts "✅ Created #{Favorite.count} favorites"

puts "\n🎉 Seed data created successfully!"
