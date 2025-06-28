require 'httparty'

class TheMealDbService
  include HTTParty
  base_uri 'https://www.themealdb.com/api/json/v1/1'

  def search_desserts
    # デザートカテゴリーを検索
    response = self.class.get('/filter.php?c=Dessert')
    
    if response.success? && response['meals']
      dessert_recipes = response['meals'].map do |meal|
        get_recipe_details(meal['idMeal'])
      end.compact.first(10) # 最大10件
      
      { recipes: dessert_recipes, total: dessert_recipes.length }
    else
      { recipes: [], total: 0, error: 'No desserts found' }
    end
  end

  def search_by_name(name)
    response = self.class.get("/search.php?s=#{CGI.escape(name)}")
    
    if response.success? && response['meals']
      recipes = response['meals'].map { |meal| format_recipe(meal) }
      { recipes: recipes, total: recipes.length }
    else
      { recipes: [], total: 0, error: 'No recipes found' }
    end
  end

  private

  def get_recipe_details(meal_id)
    response = self.class.get("/lookup.php?i=#{meal_id}")
    
    if response.success? && response['meals'] && response['meals'].first
      format_recipe(response['meals'].first)
    else
      nil
    end
  end

  def format_recipe(meal_data)
    {
      title: meal_data['strMeal'],
      description: meal_data['strInstructions']&.slice(0, 200) || "#{meal_data['strMeal']}のレシピです。",
      thumbnail_url: meal_data['strMealThumb'],
      video_url: meal_data['strYoutube'],
      duration: estimate_cooking_time(meal_data['strInstructions']),
      difficulty: 'medium',
      category: determine_category(meal_data),
      ingredients: extract_ingredients(meal_data),
      instructions: extract_instructions(meal_data['strInstructions']),
      source_type: 'themealdb',
      source_id: meal_data['idMeal'],
      source_url: "https://www.themealdb.com/meal/#{meal_data['idMeal']}"
    }
  end

  def extract_ingredients(meal_data)
    ingredients = []
    
    (1..20).each do |i|
      ingredient = meal_data["strIngredient#{i}"]
      measure = meal_data["strMeasure#{i}"]
      
      break if ingredient.blank?
      
      if measure.present?
        ingredients << "#{ingredient.strip} #{measure.strip}"
      else
        ingredients << ingredient.strip
      end
    end
    
    ingredients
  end

  def extract_instructions(instructions_text)
    return [] if instructions_text.blank?
    
    # 改行やピリオドで分割
    steps = instructions_text.split(/\r?\n|\./)
                           .map(&:strip)
                           .reject(&:blank?)
                           .first(10)
    
    steps.map.with_index(1) { |step, index| "#{index}. #{step}" }
  end

  def estimate_cooking_time(instructions)
    return 30 if instructions.blank?
    
    # 時間の記載を探す
    time_matches = instructions.scan(/(\d+)\s*(?:minute|min)/i)
    if time_matches.any?
      time_matches.map { |match| match[0].to_i }.max
    else
      30 # デフォルト
    end
  end

  def determine_category(meal_data)
    category = meal_data['strCategory']&.downcase
    
    case category
    when 'dessert'
      'modern'
    when 'vegetarian'
      'vegan'
    else
      'modern'
    end
  end
end