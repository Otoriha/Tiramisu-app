import { youtubeApi } from './youtubeApi'
import type { Video } from '../types/youtube'

export interface CollectedRecipeData {
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  duration: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  source_type: 'youtube'
  source_id: string
}

export class RecipeDataCollector {
  private readonly TIRAMISU_KEYWORDS = [
    'ティラミス レシピ',
    'ティラミス 作り方',
    'tiramisu recipe',
    'ティラミス 簡単',
    'ティラミス 本格',
    'ヴィーガン ティラミス',
    'ティラミス デザート',
    'ティラミス おうちカフェ'
  ]

  /**
   * YouTube APIからティラミスレシピ動画を検索して収集
   */
  async collectTiramisuRecipes(maxResults: number = 50): Promise<CollectedRecipeData[]> {
    const allRecipes: CollectedRecipeData[] = []
    const seenVideoIds = new Set<string>()

    for (const keyword of this.TIRAMISU_KEYWORDS) {
      try {
        console.log(`Searching for: ${keyword}`)
        
        const searchResult = await youtubeApi.searchVideos(keyword, {
          maxResults: Math.ceil(maxResults / this.TIRAMISU_KEYWORDS.length),
          order: 'relevance',
          duration: 'medium', // 4-20分の動画
          type: 'video'
        })

        for (const video of searchResult.items) {
          // 重複チェック
          if (seenVideoIds.has(video.id.videoId)) {
            continue
          }
          seenVideoIds.add(video.id.videoId)

          const recipeData = this.convertVideoToRecipe(video)
          if (recipeData) {
            allRecipes.push(recipeData)
          }
        }

        // API制限を考慮して少し待機
        await this.sleep(100)
        
      } catch (error) {
        console.error(`Error searching for ${keyword}:`, error)
      }
    }

    console.log(`Collected ${allRecipes.length} unique tiramisu recipes`)
    return allRecipes
  }

  /**
   * YouTube動画データをレシピデータに変換
   */
  private convertVideoToRecipe(video: Video): CollectedRecipeData | null {
    try {
      const title = video.snippet.title
      const description = video.snippet.description
      
      // ティラミス関連かチェック
      if (!this.isTiramisuRelated(title, description)) {
        return null
      }

      return {
        title: this.cleanTitle(title),
        description: this.extractDescription(description),
        video_url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        thumbnail_url: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
        duration: this.estimateDuration(title, description),
        difficulty: this.estimateDifficulty(title, description),
        category: this.determineCategory(title, description),
        source_type: 'youtube',
        source_id: video.id.videoId
      }
    } catch (error) {
      console.error('Error converting video to recipe:', error)
      return null
    }
  }

  /**
   * ティラミス関連の動画かチェック
   */
  private isTiramisuRelated(title: string, description: string): boolean {
    const content = (title + ' ' + description).toLowerCase()
    const tiramisuKeywords = ['ティラミス', 'tiramisu', 'ﾃｨﾗﾐｽ']
    const recipeKeywords = ['レシピ', 'recipe', '作り方', 'how to make', '手作り']
    
    const hasTiramisu = tiramisuKeywords.some(keyword => 
      content.includes(keyword.toLowerCase())
    )
    const hasRecipe = recipeKeywords.some(keyword => 
      content.includes(keyword.toLowerCase())
    )
    
    return hasTiramisu && hasRecipe
  }

  /**
   * タイトルをクリーンアップ
   */
  private cleanTitle(title: string): string {
    // 不要な文字を除去
    return title
      .replace(/【.*?】/g, '') // 【】を除去
      .replace(/\[.*?\]/g, '') // []を除去  
      .replace(/\s+/g, ' ') // 連続スペースを単一に
      .trim()
      .slice(0, 100) // 最大100文字
  }

  /**
   * 説明文から要約を抽出
   */
  private extractDescription(description: string): string {
    // 最初の200文字を取得し、改行で区切って最初の段落を使用
    const firstParagraph = description
      .split('\n')[0]
      .slice(0, 200)
      .trim()
    
    return firstParagraph || 'YouTube動画から取得したティラミスレシピです。'
  }

  /**
   * 調理時間を推定
   */
  private estimateDuration(title: string, description: string): number {
    const content = (title + ' ' + description).toLowerCase()
    
    // 時間の記載を探す
    const timeMatches = content.match(/(\d+)\s*分|(\d+)\s*min/g)
    if (timeMatches) {
      const minutes = timeMatches
        .map(match => parseInt(match.match(/\d+/)?.[0] || '0'))
        .filter(num => num > 0 && num < 300) // 0-300分の範囲
      
      if (minutes.length > 0) {
        return Math.min(...minutes) // 最短時間を採用
      }
    }
    
    // キーワードベースの推定
    if (content.includes('簡単') || content.includes('時短') || content.includes('クイック')) {
      return 20
    } else if (content.includes('本格') || content.includes('丁寧')) {
      return 60
    }
    
    return 30 // デフォルト
  }

  /**
   * 難易度を推定
   */
  private estimateDifficulty(title: string, description: string): 'easy' | 'medium' | 'hard' {
    const content = (title + ' ' + description).toLowerCase()
    
    if (content.includes('簡単') || content.includes('時短') || content.includes('初心者')) {
      return 'easy'
    } else if (content.includes('本格') || content.includes('プロ') || content.includes('上級')) {
      return 'hard'
    }
    
    return 'medium'
  }

  /**
   * カテゴリーを決定
   */
  private determineCategory(title: string, description: string): string {
    const content = (title + ' ' + description).toLowerCase()
    
    if (content.includes('ヴィーガン') || content.includes('vegan')) {
      return 'vegan'
    } else if (content.includes('簡単') || content.includes('時短')) {
      return 'quick'  
    } else if (content.includes('本格') || content.includes('クラシック')) {
      return 'classic'
    } else if (content.includes('グルテンフリー')) {
      return 'gluten_free'
    }
    
    return 'modern'
  }

  /**
   * 指定時間待機
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const recipeDataCollector = new RecipeDataCollector()