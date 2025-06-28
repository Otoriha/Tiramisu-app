namespace :recipes do
  desc "Import high-quality tiramisu recipe samples"
  task import_samples: :environment do
    puts "🍰 Importing high-quality tiramisu recipe samples..."
    
    sample_recipes = [
      {
        title: "本格イタリアンティラミス",
        description: "イタリア本場の味を再現した、マスカルポーネチーズとエスプレッソが織りなす濃厚で上品なティラミスです。",
        thumbnail_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500",
        video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 45,
        difficulty: "medium",
        category: "classic",
        ingredients: [
          "マスカルポーネチーズ 250g",
          "卵黄 3個",
          "グラニュー糖 60g",
          "生クリーム 200ml",
          "エスプレッソ（濃いめ） 200ml",
          "ラディサボイアルディ 24枚",
          "無糖ココアパウダー 適量",
          "マルサラ酒 大さじ2（オプション）"
        ],
        instructions: [
          "エスプレッソを濃いめに淹れて冷ましておく",
          "卵黄とグラニュー糖をボウルに入れ、湯煎で白っぽくもったりするまで泡立てる",
          "火から下ろしてマスカルポーネチーズを加え、なめらかになるまで混ぜる",
          "生クリームを八分立てにして、マスカルポーネクリームと合わせる",
          "ラディサボイアルディを冷めたエスプレッソに軽く浸す",
          "容器にビスケットを敷き詰め、クリームを重ねる",
          "この作業を2〜3回繰り返して層を作る",
          "冷蔵庫で4時間以上、できれば一晩冷やす",
          "食べる直前にココアパウダーをふりかける"
        ],
        source_type: "manual",
        source_id: "classic_tiramisu_001"
      },
      {
        title: "簡単15分ティラミス風デザート",
        description: "忙しい時でもすぐに作れる、ティラミス風の簡単デザート。クリームチーズベースで手軽に本格的な味わい。",
        thumbnail_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500",
        video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 15,
        difficulty: "easy",
        category: "quick",
        ingredients: [
          "クリームチーズ 200g",
          "生クリーム 200ml",
          "砂糖 40g",
          "インスタントコーヒー 大さじ2",
          "お湯 100ml",
          "市販のスポンジケーキ 1個",
          "ココアパウダー 適量"
        ],
        instructions: [
          "クリームチーズを室温で柔らかくしておく",
          "インスタントコーヒーをお湯で溶かして冷ます",
          "生クリームと砂糖を八分立てに泡立てる",
          "クリームチーズをなめらかになるまで混ぜ、生クリームと合わせる",
          "スポンジケーキを一口大に切ってコーヒーに浸す",
          "グラスにスポンジとクリームを交互に重ねる",
          "冷蔵庫で30分以上冷やす",
          "ココアパウダーをふりかけて完成"
        ],
        source_type: "manual",
        source_id: "quick_tiramisu_001"
      },
      {
        title: "ヴィーガンティラミス（植物性）",
        description: "卵や乳製品を使わない、植物性材料だけで作るヘルシーなティラミス。カシューナッツベースのクリームが濃厚。",
        thumbnail_url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500",
        video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 60,
        difficulty: "medium",
        category: "vegan",
        ingredients: [
          "生カシューナッツ 200g（一晩浸水）",
          "ココナッツクリーム 400ml",
          "メープルシロップ 80ml",
          "ココナッツオイル 50ml",
          "レモン汁 大さじ2",
          "バニラエッセンス 小さじ1",
          "濃いコーヒー 200ml",
          "ヴィーガンビスケット 20枚",
          "ローカカオパウダー 適量"
        ],
        instructions: [
          "カシューナッツを一晩浸水させて柔らかくする",
          "水を切ったカシューナッツをフードプロセッサーでペースト状にする",
          "ココナッツクリーム、メープルシロップ、レモン汁、バニラエッセンスを加えてなめらかにする",
          "ココナッツオイルを湯煎で溶かして加え、よく混ぜる",
          "濃いコーヒーを冷ましておく",
          "ビスケットをコーヒーに浸して容器に敷く",
          "カシューナッツクリームを重ね、層を作る",
          "冷蔵庫で4時間以上冷やし固める",
          "ローカカオパウダーをふりかけて完成"
        ],
        source_type: "manual",
        source_id: "vegan_tiramisu_001"
      },
      {
        title: "抹茶ティラミス（和風アレンジ）",
        description: "日本の抹茶を使った和風ティラミス。ほろ苦い抹茶と甘いマスカルポーネが絶妙にマッチした創作デザート。",
        thumbnail_url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500",
        video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 40,
        difficulty: "medium",
        category: "modern",
        ingredients: [
          "マスカルポーネチーズ 250g",
          "卵黄 3個",
          "グラニュー糖 60g",
          "生クリーム 200ml",
          "抹茶パウダー 大さじ2",
          "お湯 200ml",
          "カステラ 1本",
          "抹茶パウダー（仕上げ用） 適量",
          "あんこ 100g（オプション）"
        ],
        instructions: [
          "抹茶パウダーをお湯で溶いて濃い抹茶液を作り、冷ます",
          "卵黄とグラニュー糖を湯煎で泡立てる",
          "マスカルポーネチーズを加えてなめらかにする",
          "生クリームを八分立てにして合わせる",
          "カステラを薄切りにして抹茶液に浸す",
          "容器にカステラとクリームを交互に重ねる",
          "お好みであんこも挟む",
          "冷蔵庫で3時間以上冷やす",
          "抹茶パウダーをふりかけて完成"
        ],
        source_type: "manual",
        source_id: "matcha_tiramisu_001"
      },
      {
        title: "チョコレートティラミス",
        description: "チョコレート好きにはたまらない、濃厚なチョコレート風味のティラミス。大人のビターな味わい。",
        thumbnail_url: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500",
        video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 50,
        difficulty: "hard",
        category: "modern",
        ingredients: [
          "マスカルポーネチーズ 250g",
          "卵黄 4個",
          "グラニュー糖 80g",
          "生クリーム 250ml",
          "ダークチョコレート 100g",
          "エスプレッソ 200ml",
          "ココアリキュール 大さじ2",
          "ラディサボイアルディ 24枚",
          "ココアパウダー 適量",
          "チョコレートフレーク 適量"
        ],
        instructions: [
          "ダークチョコレートを湯煎で溶かしておく",
          "卵黄とグラニュー糖を湯煎で泡立てる",
          "溶かしたチョコレートを少しずつ加える",
          "マスカルポーネチーズを加えてなめらかにする",
          "生クリームを八分立てにして合わせる",
          "エスプレッソにココアリキュールを加えて冷ます",
          "ビスケットをコーヒー液に浸す",
          "容器にビスケットとチョコクリームを交互に重ねる",
          "冷蔵庫で一晩冷やす",
          "ココアパウダーとチョコレートフレークで仕上げる"
        ],
        source_type: "manual",
        source_id: "chocolate_tiramisu_001"
      },
      {
        title: "いちごティラミス（春限定）",
        description: "春の訪れを感じる、フレッシュないちごを使った華やかなティラミス。見た目も美しいお祝いデザート。",
        thumbnail_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500",
        video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: 35,
        difficulty: "easy",
        category: "modern",
        ingredients: [
          "マスカルポーネチーズ 200g",
          "生クリーム 200ml",
          "砂糖 50g",
          "いちご 200g",
          "いちごジャム 大さじ3",
          "水 100ml",
          "スポンジケーキ 1個",
          "粉糖 適量",
          "ミント 適量"
        ],
        instructions: [
          "いちごを半分にカットし、飾り用を別にしておく",
          "いちごジャムを水で薄めてシロップを作る",
          "マスカルポーネチーズと砂糖を混ぜる",
          "生クリームを八分立てにして合わせる",
          "スポンジケーキを薄切りにしていちごシロップに浸す",
          "容器にスポンジ、クリーム、いちごを交互に重ねる",
          "冷蔵庫で2時間以上冷やす",
          "仕上げにいちごを飾り、粉糖とミントをのせる"
        ],
        source_type: "manual",
        source_id: "strawberry_tiramisu_001"
      }
    ]

    created_count = 0
    
    sample_recipes.each do |recipe_data|
      begin
        # 重複チェック
        existing = Recipe.find_by(
          source_type: recipe_data[:source_type],
          source_id: recipe_data[:source_id]
        )
        
        if existing
          puts "  Skipping existing recipe: #{recipe_data[:title]}"
          next
        end
        
        recipe = Recipe.create!(
          title: recipe_data[:title],
          description: recipe_data[:description],
          thumbnail_url: recipe_data[:thumbnail_url],
          video_url: recipe_data[:video_url],
          duration: recipe_data[:duration],
          difficulty: recipe_data[:difficulty],
          category: recipe_data[:category],
          ingredients: recipe_data[:ingredients],
          instructions: recipe_data[:instructions],
          source_type: recipe_data[:source_type],
          source_id: recipe_data[:source_id],
          published_at: Time.current
        )
        
        created_count += 1
        puts "  ✅ Created: #{recipe.title}"
        
      rescue => e
        puts "  ❌ Error creating recipe: #{e.message}"
      end
    end
    
    puts "\n🎉 Sample recipe import completed!"
    puts "- Recipes created: #{created_count}"
    puts "- Total recipes in database: #{Recipe.count}"
  end
end