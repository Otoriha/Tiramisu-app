namespace :scraping do
  desc "Scrape tiramisu recipes from various recipe websites"
  task tiramisu_recipes: :environment do
    puts "🍰 Starting tiramisu recipe scraping..."
    
    max_recipes = ENV['MAX_RECIPES']&.to_i || 20
    
    scraper = RecipeScraperService.new
    result = scraper.scrape_tiramisu_recipes(max_recipes: max_recipes)
    
    puts "\n📊 Scraping Results:"
    puts "- Total recipes found: #{result[:total_scraped]}"
    puts "- Errors: #{result[:errors].length}"
    
    if result[:errors].any?
      puts "\n❌ Errors:"
      result[:errors].each { |error| puts "  - #{error}" }
    end
    
    if result[:recipes].any?
      puts "\n💾 Saving recipes to database..."
      
      created_count = 0
      error_count = 0
      
      result[:recipes].each_with_index do |recipe_data, index|
        begin
          # 既存レシピの重複チェック
          existing = Recipe.find_by(
            source_type: recipe_data[:source_type],
            source_id: recipe_data[:source_id]
          )
          
          if existing
            puts "  Skipping duplicate recipe: #{recipe_data[:title]}"
            next
          end
          
          # 新しいレシピを作成
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
          puts "  ✅ Created: #{recipe.title} (#{recipe.difficulty}, #{recipe.duration}分)"
          
        rescue => e
          error_count += 1
          puts "  ❌ Error creating recipe #{index + 1}: #{e.message}"
        end
      end
      
      puts "\n🎉 Scraping completed!"
      puts "- Recipes created: #{created_count}"
      puts "- Errors: #{error_count}"
      puts "- Total recipes in database: #{Recipe.count}"
      
    else
      puts "\n😢 No recipes found to save."
    end
  end

  desc "Clean up old scraped recipes (older than 30 days)"
  task cleanup_old: :environment do
    puts "🧹 Cleaning up old scraped recipes..."
    
    old_recipes = Recipe.where(source_type: 'scraping')
                       .where('created_at < ?', 30.days.ago)
    
    count = old_recipes.count
    old_recipes.destroy_all
    
    puts "🗑️  Deleted #{count} old scraped recipes"
    puts "📊 Total recipes remaining: #{Recipe.count}"
  end

  desc "Show scraping statistics"
  task stats: :environment do
    puts "📈 Recipe Scraping Statistics:"
    puts ""
    
    total_recipes = Recipe.count
    scraped_recipes = Recipe.where(source_type: 'scraping').count
    other_recipes = total_recipes - scraped_recipes
    
    puts "Total recipes: #{total_recipes}"
    puts "Scraped recipes: #{scraped_recipes}"
    puts "Other recipes: #{other_recipes}"
    puts ""
    
    if scraped_recipes > 0
      puts "Scraped recipes by difficulty:"
      Recipe.where(source_type: 'scraping').group(:difficulty).count.each do |difficulty, count|
        puts "  #{difficulty}: #{count}"
      end
      puts ""
      
      puts "Scraped recipes by category:"
      Recipe.where(source_type: 'scraping').group(:category).count.each do |category, count|
        puts "  #{category}: #{count}"
      end
      puts ""
      
      avg_duration = Recipe.where(source_type: 'scraping').average(:duration)
      puts "Average cooking time: #{avg_duration&.round(1)} minutes"
    end
  end
end