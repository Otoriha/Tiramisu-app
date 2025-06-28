namespace :rakuten do
  desc "Import tiramisu recipes from Rakuten Recipe API"
  task import_tiramisu: :environment do
    puts "🍰 楽天レシピAPIからティラミスレシピを取得中..."
    
    begin
      service = RakutenRecipeService.new
      result = service.search_tiramisu_recipes(hits: 20)
      
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
          
          # ティラミス関連かチェック
          unless tiramisu_related?(recipe_data[:title], recipe_data[:description])
            puts "  ⏭️  スキップ: #{recipe_data[:title]} (ティラミス関連ではない)"
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
      puts "❌ 楽天レシピAPIの接続エラー: #{e.message}"
      puts "💡 RAKUTEN_APP_IDが設定されているか確認してください"
      exit 1
    end
  end

  desc "Show Rakuten Recipe API configuration"
  task config: :environment do
    puts "📋 楽天レシピAPI設定状況:"
    puts ""
    
    app_id = Rails.application.credentials.dig(:rakuten, :app_id) || ENV['RAKUTEN_APP_ID']
    
    if app_id.present?
      puts "✅ App ID: #{app_id[0..8]}..." # 最初の8文字のみ表示
      puts "🔗 設定方法: 環境変数 RAKUTEN_APP_ID または credentials"
    else
      puts "❌ App IDが設定されていません"
      puts ""
      puts "📝 設定手順:"
      puts "1. https://webservice.rakuten.co.jp/ でアプリIDを取得"
      puts "2. 環境変数を設定: export RAKUTEN_APP_ID=your_app_id"
      puts "3. または Rails credentials に設定:"
      puts "   rails credentials:edit"
      puts "   rakuten:"
      puts "     app_id: your_app_id"
    end
    
    puts ""
    puts "🔍 テスト接続:"
    if app_id.present?
      begin
        service = RakutenRecipeService.new
        puts "✅ RakutenRecipeServiceを初期化できました"
      rescue => e
        puts "❌ エラー: #{e.message}"
      end
    else
      puts "⏭️  App IDが未設定のためスキップ"
    end
  end

  desc "Test Rakuten Recipe API connection"
  task test: :environment do
    puts "🧪 楽天レシピAPI接続テスト..."
    
    begin
      service = RakutenRecipeService.new
      result = service.search_tiramisu_recipes(hits: 3)
      
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

  private

  def tiramisu_related?(title, description)
    content = "#{title} #{description}".downcase
    tiramisu_keywords = ['ティラミス', 'tiramisu', 'ﾃｨﾗﾐｽ']
    
    tiramisu_keywords.any? { |keyword| content.include?(keyword) }
  end
end