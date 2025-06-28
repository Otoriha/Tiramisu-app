namespace :translate do
  desc "Translate all English recipes to Japanese"
  task recipes: :environment do
    puts "🌐 英語レシピを日本語に翻訳中..."
    
    # 英語と思われるレシピを検索
    english_recipes = Recipe.where(source_type: ['themealdb', 'scraping'])
                           .where("title ~ '[a-zA-Z]'") # 英語を含むタイトル
    
    puts "📊 翻訳対象: #{english_recipes.count}件のレシピ"
    
    if english_recipes.count == 0
      puts "✅ 翻訳する英語レシピがありません"
      return
    end
    
    translation_service = TranslationService.new
    translated_count = 0
    error_count = 0
    
    english_recipes.find_each.with_index do |recipe, index|
      puts "\n🔄 翻訳中 #{index + 1}/#{english_recipes.count}: #{recipe.title}"
      
      begin
        # タイトルと説明を翻訳
        translated_title = translation_service.translate_with_google(recipe.title)
        translated_description = translation_service.translate_with_google(recipe.description)
        
        # 材料を翻訳
        translated_ingredients = translation_service.translate_ingredients(recipe.ingredients)
        
        # 手順を翻訳
        translated_instructions = translation_service.translate_instructions(recipe.instructions)
        
        # レシピを更新
        recipe.update!(
          title: translated_title,
          description: translated_description,
          ingredients: translated_ingredients,
          instructions: translated_instructions
        )
        
        translated_count += 1
        puts "  ✅ 完了: #{translated_title}"
        
        # API制限を考慮して待機
        sleep(0.1) if ENV['GOOGLE_TRANSLATE_API_KEY'].present?
        
      rescue => e
        error_count += 1
        puts "  ❌ エラー: #{e.message}"
      end
    end
    
    puts "\n🎉 翻訳完了!"
    puts "- 成功: #{translated_count}件"
    puts "- エラー: #{error_count}件"
    puts "- 総レシピ数: #{Recipe.count}件"
  end

  desc "Translate specific recipe by ID"
  task :recipe, [:id] => :environment do |task, args|
    recipe_id = args[:id]
    
    if recipe_id.blank?
      puts "❌ レシピIDを指定してください: rails translate:recipe[123]"
      exit 1
    end
    
    recipe = Recipe.find_by(id: recipe_id)
    
    if recipe.nil?
      puts "❌ ID #{recipe_id} のレシピが見つかりません"
      exit 1
    end
    
    puts "🔄 レシピを翻訳中: #{recipe.title}"
    
    translation_service = TranslationService.new
    
    begin
      # 使用する翻訳サービスを選択
      method = ENV['TRANSLATION_METHOD']&.to_sym || :google
      
      case method
      when :deepl
        puts "📡 DeepL APIを使用"
        translated_title = translation_service.translate_with_deepl(recipe.title)
        translated_description = translation_service.translate_with_deepl(recipe.description)
        translated_ingredients = recipe.ingredients.map { |ing| translation_service.translate_with_deepl(ing) }
        translated_instructions = recipe.instructions.map { |inst| translation_service.translate_with_deepl(inst) }
      else
        puts "📡 Google Translate APIを使用"
        translated_title = translation_service.translate_with_google(recipe.title)
        translated_description = translation_service.translate_with_google(recipe.description)
        translated_ingredients = translation_service.translate_ingredients(recipe.ingredients)
        translated_instructions = translation_service.translate_instructions(recipe.instructions)
      end
      
      # レシピを更新
      recipe.update!(
        title: translated_title,
        description: translated_description,
        ingredients: translated_ingredients,
        instructions: translated_instructions
      )
      
      puts "✅ 翻訳完了!"
      puts "   タイトル: #{translated_title}"
      puts "   説明: #{translated_description}"
      puts "   材料数: #{translated_ingredients.length}個"
      puts "   手順数: #{translated_instructions.length}ステップ"
      
    rescue => e
      puts "❌ 翻訳エラー: #{e.message}"
      exit 1
    end
  end

  desc "Show translation service configuration"
  task config: :environment do
    puts "📋 翻訳サービス設定状況:"
    puts ""
    
    google_key = ENV['GOOGLE_TRANSLATE_API_KEY']
    deepl_key = ENV['DEEPL_API_KEY']
    openai_key = ENV['OPENAI_API_KEY']
    
    puts "Google Translate API: #{google_key.present? ? '✅ 設定済み' : '❌ 未設定'}"
    puts "DeepL API: #{deepl_key.present? ? '✅ 設定済み' : '❌ 未設定'}"
    puts "OpenAI API: #{openai_key.present? ? '✅ 設定済み' : '❌ 未設定'}"
    
    puts ""
    puts "🔧 設定方法:"
    puts "1. Google Translate API:"
    puts "   export GOOGLE_TRANSLATE_API_KEY=your_api_key"
    puts "2. DeepL API:"
    puts "   export DEEPL_API_KEY=your_api_key"
    puts "3. OpenAI API:"
    puts "   export OPENAI_API_KEY=your_api_key"
    
    if google_key.blank? && deepl_key.blank? && openai_key.blank?
      puts ""
      puts "⚠️  翻訳APIが設定されていません。"
      puts "   少なくとも1つのAPIキーを設定してください。"
    end
  end

  desc "Test translation service"
  task test: :environment do
    puts "🧪 翻訳サービステスト..."
    
    test_text = "Apple & Blackberry Crumble"
    translation_service = TranslationService.new
    
    if ENV['GOOGLE_TRANSLATE_API_KEY'].present?
      puts "\n📡 Google Translate APIテスト:"
      result = translation_service.translate_with_google(test_text)
      puts "  入力: #{test_text}"
      puts "  出力: #{result}"
    end
    
    if ENV['DEEPL_API_KEY'].present?
      puts "\n📡 DeepL APIテスト:"
      result = translation_service.translate_with_deepl(test_text)
      puts "  入力: #{test_text}"
      puts "  出力: #{result}"
    end
    
    if ENV['GOOGLE_TRANSLATE_API_KEY'].blank? && ENV['DEEPL_API_KEY'].blank?
      puts "\n⚠️  翻訳APIが設定されていません。"
      puts "   rails translate:config で設定方法を確認してください。"
    end
  end
end