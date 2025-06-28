namespace :themealdb do
  desc "Import dessert recipes from TheMealDB (free API)"
  task import_desserts: :environment do
    puts "🍰 TheMealDBから無料でデザートレシピを取得中..."
    
    begin
      service = TheMealDbService.new
      result = service.search_desserts
      
      if result[:error]
        puts "❌ APIエラー: #{result[:error]}"
        exit 1
      end
      
      puts "📊 取得結果: #{result[:recipes].length}件のレシピを発見"
      
      created_count = 0
      skipped_count = 0
      error_count = 0
      
      result[:recipes].each_with_index do |recipe_data, index|
        begin
          # 重複チェック
          existing = Recipe.find_by(
            source_type: recipe_data[:source_type],
            source_id: recipe_data[:source_id]
          )
          
          if existing
            puts "  ⏭️  スキップ: #{recipe_data[:title]} (既に存在)"
            skipped_count += 1
            next
          end
          
          # レシピを作成
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
            source_url: recipe_data[:source_url],
            published_at: Time.current
          )
          
          created_count += 1
          puts "  ✅ 作成: #{recipe.title} (#{recipe.difficulty}, #{recipe.duration}分)"
          
        rescue => e
          error_count += 1
          puts "  ❌ エラー #{index + 1}: #{e.message}"
        end
      end
      
      puts "\n🎉 インポート完了!"
      puts "- 作成: #{created_count}件"
      puts "- スキップ: #{skipped_count}件"
      puts "- エラー: #{error_count}件"
      puts "- 総レシピ数: #{Recipe.count}件"
      
    rescue => e
      puts "❌ TheMealDB APIの接続エラー: #{e.message}"
      exit 1
    end
  end

  desc "Test TheMealDB API connection"
  task test: :environment do
    puts "🧪 TheMealDB API接続テスト..."
    
    begin
      service = TheMealDbService.new
      result = service.search_by_name('tiramisu')
      
      if result[:error]
        puts "❌ APIエラー: #{result[:error]}"
      else
        puts "✅ 接続成功! #{result[:recipes].length}件のレシピを取得"
        
        result[:recipes].each_with_index do |recipe, index|
          puts "  #{index + 1}. #{recipe[:title]}"
          puts "     材料数: #{recipe[:ingredients].length}個"
          puts "     手順数: #{recipe[:instructions].length}ステップ"
          puts ""
        end
      end
      
    rescue => e
      puts "❌ 接続エラー: #{e.message}"
    end
  end
end