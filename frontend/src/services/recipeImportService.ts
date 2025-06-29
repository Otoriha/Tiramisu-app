import { apiClient } from './apiClient'
import { recipeDataCollector, type CollectedRecipeData } from './recipeDataCollector'

export interface ImportResult {
  success: boolean
  created_count: number
  total_count: number
  errors: string[]
}

/**
 * レシピデータのインポートサービス
 */
export class RecipeImportService {
  /**
   * YouTube APIからティラミスレシピを収集してバックエンドに保存
   */
  async collectAndImportTiramisuRecipes(maxResults: number = 50): Promise<ImportResult> {
    try {
      console.log('Starting recipe collection from YouTube...')
      
      // 1. YouTube APIからレシピデータを収集
      const collectedRecipes = await recipeDataCollector.collectTiramisuRecipes(maxResults)
      
      if (collectedRecipes.length === 0) {
        return {
          success: false,
          created_count: 0,
          total_count: 0,
          errors: ['No tiramisu recipes found on YouTube']
        }
      }

      console.log(`Collected ${collectedRecipes.length} recipes, importing to backend...`)

      // 2. バックエンドに一括インポート
      const importResult = await this.bulkImportRecipes(collectedRecipes)
      
      console.log('Import completed:', importResult)
      return importResult

    } catch (error) {
      console.error('Error during recipe collection and import:', error)
      return {
        success: false,
        created_count: 0,
        total_count: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      }
    }
  }

  /**
   * レシピデータをバックエンドに一括インポート
   */
  async bulkImportRecipes(recipes: CollectedRecipeData[]): Promise<ImportResult> {
    try {
      // AI を使って材料と手順を生成（簡易版）
      const recipesWithDetails = await Promise.all(
        recipes.map(async (recipe) => {
          const ingredients = this.generateIngredients(recipe.title, recipe.description)
          const instructions = this.generateInstructions(recipe.title, recipe.description, recipe.difficulty)
          
          return {
            title: recipe.title,
            description: recipe.description,
            thumbnail_url: recipe.thumbnail_url,
            video_url: recipe.video_url,
            duration: recipe.duration,
            difficulty: recipe.difficulty,
            category: recipe.category,
            source_type: recipe.source_type,
            source_id: recipe.source_id,
            published_at: new Date().toISOString(),
            ingredients,
            instructions
          }
        })
      )

      const response = await apiClient.post<ImportResult>('/recipes/bulk_import', {
        recipes: recipesWithDetails
      })

      return response

    } catch (error) {
      console.error('Error during bulk import:', error)
      throw error
    }
  }

  /**
   * タイトルと説明から材料リストを生成（簡易版）
   */
  private generateIngredients(title: string, description: string): string[] {
    const content = (title + ' ' + description).toLowerCase()
    
    const baseIngredients = [
      'マスカルポーネチーズ 250g',
      '卵黄 3個',
      '砂糖 60g',
      'エスプレッソ 200ml',
      'ラディサボイアルディ 200g',
      'ココアパウダー 適量'
    ]

    // ヴィーガンレシピの場合
    if (content.includes('ヴィーガン') || content.includes('vegan')) {
      return [
        'カシューナッツ 200g',
        'ココナッツクリーム 400ml', 
        'メープルシロップ 80ml',
        'コーヒー 200ml',
        'ビーガンビスケット 150g',
        'カカオパウダー 適量'
      ]
    }

    // 簡単レシピの場合
    if (content.includes('簡単') || content.includes('時短')) {
      return [
        'クリームチーズ 200g',
        '生クリーム 200ml',
        '砂糖 50g',
        'インスタントコーヒー 大さじ2',
        'ビスケット 100g',
        'ココアパウダー 適量'
      ]
    }

    return baseIngredients
  }

  /**
   * タイトルと説明から手順を生成（簡易版）
   */
  private generateInstructions(title: string, description: string, _difficulty: string): string[] {
    const content = (title + ' ' + description).toLowerCase()

    // ヴィーガンレシピの場合
    if (content.includes('ヴィーガン') || content.includes('vegan')) {
      return [
        'カシューナッツを一晩浸水させる',
        'ナッツとココナッツクリームをブレンダーでなめらかになるまで混ぜる',
        'メープルシロップで甘みを調整する',
        'コーヒーにビスケットを浸す',
        '容器に層を作って重ねる',
        '冷蔵庫で4時間以上冷やす',
        'カカオパウダーをふりかけて完成'
      ]
    }

    // 簡単レシピの場合
    if (content.includes('簡単') || content.includes('時短')) {
      return [
        'クリームチーズを室温で柔らかくする',
        '生クリームと砂糖を八分立てに泡立てる',
        'インスタントコーヒーを少量のお湯で溶かす',
        'ビスケットをコーヒーに浸して容器に敷く',
        'クリームを重ねて冷蔵庫で冷やす',
        'ココアパウダーをふりかけて完成'
      ]
    }

    // 標準レシピ
    return [
      '卵黄と砂糖を湯煎で白っぽくなるまで混ぜる',
      'マスカルポーネチーズを加えてなめらかになるまで混ぜる',
      'エスプレッソにラディサボイアルディを浸す',
      '容器にビスケットとクリームを交互に重ねる',
      '冷蔵庫で4時間以上しっかりと冷やす',
      'ココアパウダーをふりかけて完成'
    ]
  }

  /**
   * 単一のレシピを作成
   */
  async createRecipe(recipeData: CollectedRecipeData): Promise<any> {
    const ingredients = this.generateIngredients(recipeData.title, recipeData.description)
    const instructions = this.generateInstructions(recipeData.title, recipeData.description, recipeData.difficulty)

    const recipe = {
      title: recipeData.title,
      description: recipeData.description,
      thumbnail_url: recipeData.thumbnail_url,
      video_url: recipeData.video_url,
      duration: recipeData.duration,
      difficulty: recipeData.difficulty,
      category: recipeData.category,
      source_type: recipeData.source_type,
      source_id: recipeData.source_id,
      published_at: new Date().toISOString(),
      ingredients,
      instructions
    }

    return apiClient.post('/recipes', { recipe })
  }
}

export const recipeImportService = new RecipeImportService()