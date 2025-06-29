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

# 実データのみ使用するため、モックデータは作成しない
stores = []

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
