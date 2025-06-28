require 'httparty'

class TranslationService
  include HTTParty

  def initialize
    @google_api_key = Rails.application.credentials.dig(:google, :translate_api_key) || ENV['GOOGLE_TRANSLATE_API_KEY']
    @deepl_api_key = Rails.application.credentials.dig(:deepl, :api_key) || ENV['DEEPL_API_KEY']
  end

  # Google Translate APIを使用
  def translate_with_google(text, target_language = 'ja')
    return text if text.blank? || @google_api_key.blank?
    
    begin
      response = HTTParty.post(
        'https://translation.googleapis.com/language/translate/v2',
        body: {
          key: @google_api_key,
          q: text,
          target: target_language,
          format: 'text'
        }
      )
      
      if response.success? && response['data'] && response['data']['translations']
        response['data']['translations'].first['translatedText']
      else
        Rails.logger.warn "Google Translate API error: #{response['error']}"
        text # 翻訳失敗時は元のテキストを返す
      end
      
    rescue => e
      Rails.logger.error "Translation error: #{e.message}"
      text
    end
  end

  # DeepL APIを使用（より高品質）
  def translate_with_deepl(text, target_language = 'JA')
    return text if text.blank? || @deepl_api_key.blank?
    
    begin
      response = HTTParty.post(
        'https://api-free.deepl.com/v2/translate',
        headers: {
          'Authorization' => "DeepL-Auth-Key #{@deepl_api_key}",
          'Content-Type' => 'application/x-www-form-urlencoded'
        },
        body: {
          text: text,
          target_lang: target_language
        }
      )
      
      if response.success? && response['translations']
        response['translations'].first['text']
      else
        Rails.logger.warn "DeepL API error: #{response['message']}"
        text
      end
      
    rescue => e
      Rails.logger.error "DeepL translation error: #{e.message}"
      text
    end
  end

  # レシピ専用の翻訳（OpenAI使用）
  def translate_recipe_with_openai(recipe_data)
    return recipe_data if ENV['OPENAI_API_KEY'].blank?
    
    begin
      client = OpenAI::Client.new(access_token: ENV['OPENAI_API_KEY'])
      
      prompt = build_recipe_translation_prompt(recipe_data)
      
      response = client.chat(
        parameters: {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000,
          temperature: 0.3
        }
      )
      
      if response.dig("choices", 0, "message", "content")
        parse_translated_recipe(response["choices"][0]["message"]["content"])
      else
        recipe_data
      end
      
    rescue => e
      Rails.logger.error "OpenAI translation error: #{e.message}"
      recipe_data
    end
  end

  # レシピの材料リストを翻訳
  def translate_ingredients(ingredients, method = :google)
    return ingredients if ingredients.blank?
    
    case method
    when :deepl
      ingredients.map { |ingredient| translate_with_deepl(ingredient) }
    when :openai
      translate_ingredients_with_openai(ingredients)
    else
      ingredients.map { |ingredient| translate_with_google(ingredient) }
    end
  end

  # レシピの手順を翻訳
  def translate_instructions(instructions, method = :google)
    return instructions if instructions.blank?
    
    case method
    when :deepl
      instructions.map { |instruction| translate_with_deepl(instruction) }
    when :openai
      translate_instructions_with_openai(instructions)
    else
      instructions.map { |instruction| translate_with_google(instruction) }
    end
  end

  private

  def build_recipe_translation_prompt(recipe_data)
    <<~PROMPT
      Please translate the following recipe from English to Japanese.
      Keep cooking terms accurate and natural in Japanese.
      
      Title: #{recipe_data[:title]}
      Description: #{recipe_data[:description]}
      
      Ingredients:
      #{recipe_data[:ingredients].join("\n")}
      
      Instructions:
      #{recipe_data[:instructions].join("\n")}
      
      Please respond in this exact format:
      タイトル: [translated title]
      説明: [translated description]
      材料:
      [translated ingredient 1]
      [translated ingredient 2]
      ...
      手順:
      [translated instruction 1]
      [translated instruction 2]
      ...
    PROMPT
  end

  def translate_ingredients_with_openai(ingredients)
    return ingredients if ENV['OPENAI_API_KEY'].blank?
    
    client = OpenAI::Client.new(access_token: ENV['OPENAI_API_KEY'])
    
    prompt = <<~PROMPT
      Please translate these cooking ingredients from English to Japanese.
      Use proper Japanese cooking terminology:
      
      #{ingredients.join("\n")}
      
      Respond with one ingredient per line in the same order.
    PROMPT
    
    response = client.chat(
      parameters: {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.2
      }
    )
    
    if response.dig("choices", 0, "message", "content")
      response["choices"][0]["message"]["content"].split("\n").map(&:strip).reject(&:blank?)
    else
      ingredients
    end
  rescue
    ingredients
  end

  def translate_instructions_with_openai(instructions)
    return instructions if ENV['OPENAI_API_KEY'].blank?
    
    client = OpenAI::Client.new(access_token: ENV['OPENAI_API_KEY'])
    
    prompt = <<~PROMPT
      Please translate these cooking instructions from English to Japanese.
      Use natural Japanese cooking language and proper cooking terminology:
      
      #{instructions.join("\n")}
      
      Respond with one instruction per line in the same order.
    PROMPT
    
    response = client.chat(
      parameters: {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.2
      }
    )
    
    if response.dig("choices", 0, "message", "content")
      response["choices"][0]["message"]["content"].split("\n").map(&:strip).reject(&:blank?)
    else
      instructions
    end
  rescue
    instructions
  end

  def parse_translated_recipe(translated_text)
    # OpenAIの応答をパースして構造化データに変換
    lines = translated_text.split("\n").map(&:strip)
    
    result = {}
    current_section = nil
    current_list = []
    
    lines.each do |line|
      if line.start_with?('タイトル:')
        result[:title] = line.sub('タイトル:', '').strip
      elsif line.start_with?('説明:')
        result[:description] = line.sub('説明:', '').strip
      elsif line == '材料:'
        current_section = :ingredients
        current_list = []
      elsif line == '手順:'
        result[:ingredients] = current_list.dup if current_section == :ingredients
        current_section = :instructions
        current_list = []
      elsif line.present? && current_section
        current_list << line
      end
    end
    
    result[:instructions] = current_list if current_section == :instructions
    result
  end
end