require 'httparty'
require 'nokogiri'
require 'uri'

class RecipeScraperService
  include HTTParty

  # デフォルトオプション
  default_options.update(
    verify: false,
    headers: {
      'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  )

  RECIPE_SITES = [
    {
      name: 'クックパッド',
      search_url: 'https://cookpad.com/search/%E3%83%86%E3%82%A3%E3%83%A9%E3%83%9F%E3%82%B9',
      selectors: {
        recipe_links: 'a[href*="/recipe/"]',
        title: 'h1[data-testid="recipe-title"]',
        description: '.recipe-summary p',
        ingredients: '.ingredient_list .ingredient_name',
        instructions: '.recipe_instruction p',
        image: '.recipe-main-photo img',
        servings: '.recipe_info .servings',
        cooking_time: '.recipe_info .cooking_time'
      }
    },
    {
      name: 'クラシル',
      search_url: 'https://www.kurashiru.com/search?query=%E3%83%86%E3%82%A3%E3%83%A9%E3%83%9F%E3%82%B9',
      selectors: {
        recipe_links: 'a[href*="/recipes/"]',
        title: 'h1.recipe-title',
        description: '.recipe-description',
        ingredients: '.ingredient-list .ingredient-name',
        instructions: '.instruction-list .instruction-text',
        image: '.recipe-hero-image img',
        servings: '.recipe-servings',
        cooking_time: '.recipe-time'
      }
    }
  ].freeze

  def initialize
    @scraped_recipes = []
    @errors = []
  end

  def scrape_tiramisu_recipes(max_recipes: 20)
    Rails.logger.info "Starting tiramisu recipe scraping (max: #{max_recipes})"
    
    RECIPE_SITES.each do |site|
      begin
        scrape_from_site(site, max_recipes)
      rescue => e
        @errors << "Error scraping #{site[:name]}: #{e.message}"
        Rails.logger.error "Error scraping #{site[:name]}: #{e.message}"
      end
      
      break if @scraped_recipes.length >= max_recipes
    end

    {
      recipes: @scraped_recipes.first(max_recipes),
      total_scraped: @scraped_recipes.length,
      errors: @errors
    }
  end

  private

  def scrape_from_site(site, max_recipes)
    Rails.logger.info "Scraping from #{site[:name]}"
    
    # 検索ページを取得
    search_response = self.class.get(site[:search_url])
    return unless search_response.success?

    search_doc = Nokogiri::HTML(search_response.body)
    
    # レシピリンクを取得
    recipe_links = search_doc.css(site[:selectors][:recipe_links])
                             .map { |link| link['href'] }
                             .compact
                             .uniq
                             .first(10) # サイトあたり最大10件

    recipe_links.each do |link|
      break if @scraped_recipes.length >= max_recipes
      
      begin
        recipe_data = scrape_recipe_detail(link, site)
        @scraped_recipes << recipe_data if recipe_data && valid_tiramisu_recipe?(recipe_data)
        
        # レート制限のため少し待機
        sleep(0.5)
      rescue => e
        @errors << "Error scraping recipe #{link}: #{e.message}"
        Rails.logger.error "Error scraping recipe #{link}: #{e.message}"
      end
    end
  end

  def scrape_recipe_detail(url, site)
    # 相対URLを絶対URLに変換
    full_url = url.start_with?('http') ? url : URI.join(site[:search_url], url).to_s
    
    Rails.logger.info "Scraping recipe: #{full_url}"
    
    response = self.class.get(full_url)
    return nil unless response.success?

    doc = Nokogiri::HTML(response.body)
    
    # データ抽出
    title = extract_text(doc, site[:selectors][:title])
    return nil if title.blank?

    {
      title: clean_title(title),
      description: extract_text(doc, site[:selectors][:description]) || generate_description(title),
      ingredients: extract_ingredients(doc, site[:selectors][:ingredients]),
      instructions: extract_instructions(doc, site[:selectors][:instructions]),
      thumbnail_url: extract_image_url(doc, site[:selectors][:image], full_url),
      video_url: nil, # スクレイピングでは動画URLは取得困難
      duration: extract_cooking_time(doc, site[:selectors][:cooking_time]),
      difficulty: estimate_difficulty(title),
      category: determine_category(title),
      source_type: 'scraping',
      source_id: extract_source_id(full_url),
      source_url: full_url
    }
  end

  def extract_text(doc, selector)
    return nil if selector.blank?
    
    element = doc.css(selector).first
    element&.text&.strip
  end

  def extract_ingredients(doc, selector)
    return [] if selector.blank?
    
    doc.css(selector).map { |elem| elem.text.strip }.reject(&:blank?).first(15)
  end

  def extract_instructions(doc, selector)
    return [] if selector.blank?
    
    doc.css(selector).map { |elem| elem.text.strip }.reject(&:blank?).first(10)
  end

  def extract_image_url(doc, selector, base_url)
    return nil if selector.blank?
    
    img = doc.css(selector).first
    return nil unless img
    
    src = img['src'] || img['data-src']
    return nil if src.blank?
    
    # 相対URLを絶対URLに変換
    src.start_with?('http') ? src : URI.join(base_url, src).to_s
  rescue
    nil
  end

  def extract_cooking_time(doc, selector)
    return 30 if selector.blank? # デフォルト30分
    
    time_text = extract_text(doc, selector) || ''
    
    # 時間の数値を抽出
    minutes = time_text.scan(/(\d+)分/).flatten.first&.to_i
    hours = time_text.scan(/(\d+)時間/).flatten.first&.to_i || 0
    
    total_minutes = (hours * 60) + (minutes || 0)
    total_minutes > 0 ? total_minutes : 30
  end

  def extract_source_id(url)
    # URLからIDを抽出
    url.scan(/recipe\/(\d+)/).flatten.first ||
    url.scan(/recipes\/(\d+)/).flatten.first ||
    Digest::MD5.hexdigest(url)[0..7]
  end

  def clean_title(title)
    title.gsub(/【.*?】/, '')  # 【】を除去
         .gsub(/\[.*?\]/, '')  # []を除去
         .gsub(/\s+/, ' ')     # 連続スペースを単一に
         .strip
         .slice(0, 100)        # 最大100文字
  end

  def generate_description(title)
    "美味しい#{title}のレシピです。手作りで本格的な味をお楽しみください。"
  end

  def estimate_difficulty(title)
    content = title.downcase
    
    if content.include?('簡単') || content.include?('時短') || content.include?('電子レンジ')
      'easy'
    elsif content.include?('本格') || content.include?('プロ') || content.include?('こだわり')
      'hard'
    else
      'medium'
    end
  end

  def determine_category(title)
    content = title.downcase
    
    if content.include?('ヴィーガン') || content.include?('植物性')
      'vegan'
    elsif content.include?('簡単') || content.include?('時短')
      'quick'
    elsif content.include?('本格') || content.include?('クラシック') || content.include?('伝統')
      'classic'
    elsif content.include?('グルテンフリー')
      'gluten_free'
    else
      'modern'
    end
  end

  def valid_tiramisu_recipe?(recipe_data)
    title = recipe_data[:title].downcase
    
    # ティラミス関連キーワードチェック
    tiramisu_keywords = ['ティラミス', 'tiramisu', 'ﾃｨﾗﾐｽ']
    has_tiramisu = tiramisu_keywords.any? { |keyword| title.include?(keyword) }
    
    # 基本的なデータが存在するかチェック
    has_basic_data = recipe_data[:title].present? && 
                     recipe_data[:ingredients].any? && 
                     recipe_data[:instructions].any?
    
    has_tiramisu && has_basic_data
  end
end