// import { youtubeApi } from './youtubeApi'
// import type { Video } from '../types/youtube'

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
  async collectTiramisuRecipes(_maxResults: number = 50): Promise<CollectedRecipeData[]> {
    // 現在は空の実装。将来的にYouTube APIと統合
    console.log('RecipeDataCollector: collectTiramisuRecipes called')
    return []
  }

  // private convertVideoToRecipe(_video: Video): CollectedRecipeData | null {
  //   // 現在は空の実装
  //   return null
  // }
}

export const recipeDataCollector = new RecipeDataCollector()