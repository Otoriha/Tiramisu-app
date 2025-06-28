require 'httparty'

class RakutenRecipeService
  include HTTParty
  base_uri 'https://app.rakuten.co.jp/services/api'

  def initialize
    @app_id = Rails.application.credentials.dig(:rakuten, :app_id) || ENV['RAKUTEN_APP_ID']
    raise 'Rakuten App ID not configured' if @app_id.blank?
  end

  # ティラミスレシピを検索
  def search_tiramisu_recipes(options = {})
    params = {
      applicationId: @app_id,
      keyword: 'ティラミス',
      hits: options[:hits] || 20,
      page: options[:page] || 1,
      sort: options[:sort] || 'rank', # rank, publishedDatetime
      format: 'json'
    }

    response = self.class.get('/Recipe/CategoryRanking/20170426', query: params)
    
    if response.success?
      process_recipes(response.parsed_response)
    else
      Rails.logger.error "Rakuten API Error: #{response.code} - #{response.message}"
      { recipes: [], total: 0, error: response.message }
    end
  end

  # カテゴリ別レシピ検索
  def search_by_category(category_id, options = {})
    params = {
      applicationId: @app_id,
      categoryId: category_id,
      hits: options[:hits] || 20,
      page: options[:page] || 1,
      format: 'json'
    }

    response = self.class.get('/Recipe/CategoryRanking/20170426', query: params)
    
    if response.success?
      process_recipes(response.parsed_response)
    else
      { recipes: [], total: 0, error: response.message }
    end
  end

  private

  def process_recipes(api_response)
    return { recipes: [], total: 0, error: 'Invalid response' } unless api_response['result']

    recipes = api_response['result'].map do |item|
      recipe_data = item['recipe']
      
      {
        title: clean_title(recipe_data['recipeTitle']),
        description: recipe_data['recipeDescription'] || generate_description(recipe_data['recipeTitle']),
        thumbnail_url: recipe_data['foodImageUrl'],
        video_url: nil, # 楽天レシピは動画URLを提供しない
        duration: estimate_cooking_time(recipe_data['recipeTitle'], recipe_data['recipeDescription']),
        difficulty: estimate_difficulty(recipe_data['recipeTitle'], recipe_data['recipeDescription']),
        category: determine_category(recipe_data['recipeTitle'], recipe_data['recipeDescription']),
        ingredients: extract_ingredients(recipe_data['recipeMaterial']),
        instructions: extract_instructions(recipe_data['recipeIndication']),
        source_type: 'rakuten_recipe',
        source_id: recipe_data['recipeId'].to_s,
        source_url: recipe_data['recipeUrl'],
        original_data: {
          author: recipe_data['nickname'],
          published_date: recipe_data['recipePublishday'],
          cost: recipe_data['recipeCost'],
          serve: recipe_data['recipeIndicateLevel']
        }
      }
    end

    {
      recipes: recipes,
      total: api_response['hits'] || recipes.length,
      page: api_response['page'] || 1
    }
  end

  def clean_title(title)
    return '' if title.blank?
    
    title.gsub(/【.*?】/, '')  # 【】を除去
         .gsub(/\[.*?\]/, '')  # []を除去
         .gsub(/★.*?★/, '')  # ★★を除去
         .gsub(/\s+/, ' ')     # 連続スペースを単一に
         .strip
         .slice(0, 100)        # 最大100文字
  end

  def generate_description(title)
    "楽天レシピから取得した#{title}のレシピです。"
  end

  def extract_ingredients(material_text)
    return [] if material_text.blank?
    
    # 楽天レシピの材料は改行区切りのテキスト
    ingredients = material_text.split(/\r?\n/)
                              .map(&:strip)
                              .reject(&:blank?)
                              .first(15) # 最大15個
    
    ingredients.any? ? ingredients : ['材料情報を取得できませんでした']
  end

  def extract_instructions(indication_text)
    return [] if indication_text.blank?
    
    # 楽天レシピの手順は改行区切りのテキスト
    instructions = indication_text.split(/\r?\n/)
                                 .map(&:strip)
                                 .reject(&:blank?)
                                 .map.with_index(1) { |step, index| "#{index}. #{step}" }
                                 .first(10) # 最大10ステップ
    
    instructions.any? ? instructions : ['手順情報を取得できませんでした']
  end

  def estimate_cooking_time(title, description)
    content = "#{title} #{description}".downcase
    
    # 時間の記載を探す
    if content.match(/(\d+)分/)
      $1.to_i
    elsif content.match(/(\d+)時間/)
      $1.to_i * 60
    elsif content.include?('簡単') || content.include?('時短')
      20
    elsif content.include?('本格') || content.include?('丁寧')
      60
    else
      30 # デフォルト
    end
  end

  def estimate_difficulty(title, description)
    content = "#{title} #{description}".downcase
    
    if content.include?('簡単') || content.include?('時短') || content.include?('初心者')
      'easy'
    elsif content.include?('本格') || content.include?('プロ') || content.include?('上級')
      'hard'
    else
      'medium'
    end
  end

  def determine_category(title, description)
    content = "#{title} #{description}".downcase
    
    if content.include?('ヴィーガン') || content.include?('植物性')
      'vegan'
    elsif content.include?('簡単') || content.include?('時短')
      'quick'
    elsif content.include?('本格') || content.include?('クラシック')
      'classic'
    elsif content.include?('グルテンフリー')
      'gluten_free'
    else
      'modern'
    end
  end
end