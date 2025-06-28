import { apiClient } from './apiClient';
import type { Favorite, FavoriteCreateParams, ApiResponse } from '../types/api';

export const favoriteService = {
  async getFavorites(userIdentifier: string): Promise<ApiResponse<Favorite[]>> {
    console.log('📤 お気に入り一覧取得:', { userIdentifier });
    
    try {
      const response = await apiClient.get<any>('/favorites', {
        params: { user_identifier: userIdentifier },
      });
      
      console.log('📥 お気に入り一覧レスポンス:', response);
      
      // バックエンドのレスポンス形式に合わせて変換
      const result = {
        data: response.favorites || [],
        meta: response.meta
      };
      
      console.log('🔄 変換後お気に入りデータ:', result);
      return result;
    } catch (error) {
      console.error('💥 お気に入り一覧取得エラー:', error);
      throw error;
    }
  },

  async createFavorite(params: FavoriteCreateParams): Promise<Favorite> {
    // バックエンドの期待するパラメータ形式に変換
    const requestParams = {
      user_identifier: params.user_identifier,
      ...(params.favoritable_type === 'Recipe' 
        ? { recipe_id: params.favoritable_id }
        : { store_id: params.favoritable_id }
      )
    };
    
    console.log('📤 お気に入り追加リクエスト:', {
      originalParams: params,
      requestParams,
      endpoint: '/favorites'
    });
    
    try {
      const result = await apiClient.post<Favorite>('/favorites', requestParams);
      console.log('📥 お気に入り追加レスポンス:', result);
      return result;
    } catch (error) {
      console.error('💥 お気に入り追加エラー:', error);
      throw error;
    }
  },

  async deleteFavorite(id: number, userIdentifier?: string): Promise<void> {
    const params = userIdentifier ? { user_identifier: userIdentifier } : {};
    return apiClient.delete<void>(`/favorites/${id}`, { params });
  },

  async toggleFavorite(params: FavoriteCreateParams): Promise<{ favorited: boolean; favorite?: Favorite }> {
    // バックエンドのcreateエンドポイントはトグル機能を持っているので、直接呼び出す
    const requestParams = {
      user_identifier: params.user_identifier,
      ...(params.favoritable_type === 'Recipe' 
        ? { recipe_id: params.favoritable_id }
        : { store_id: params.favoritable_id }
      )
    };
    
    const response = await apiClient.post<any>('/favorites', requestParams);
    
    // レスポンスに基づいて結果を判定
    if (response.favorite) {
      return { favorited: true, favorite: response.favorite };
    } else {
      return { favorited: false };
    }
  },
};