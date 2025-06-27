import { apiClient } from './apiClient';
import type { Favorite, FavoriteCreateParams, ApiResponse } from '../types/api';

export const favoriteService = {
  async getFavorites(userIdentifier: string): Promise<ApiResponse<Favorite[]>> {
    return apiClient.get<ApiResponse<Favorite[]>>('/favorites', {
      params: { user_identifier: userIdentifier },
    });
  },

  async createFavorite(params: FavoriteCreateParams): Promise<Favorite> {
    return apiClient.post<Favorite>('/favorites', params);
  },

  async deleteFavorite(id: number): Promise<void> {
    return apiClient.delete<void>(`/favorites/${id}`);
  },

  async toggleFavorite(params: FavoriteCreateParams): Promise<{ favorited: boolean; favorite?: Favorite }> {
    try {
      const favorite = await this.createFavorite(params);
      return { favorited: true, favorite };
    } catch (error) {
      // If already favorited, try to find and delete it
      const favorites = await this.getFavorites(params.user_identifier);
      const existingFavorite = favorites.data.find(
        f => f.favoritable_type === params.favoritable_type && 
            f.favoritable_id === params.favoritable_id
      );
      
      if (existingFavorite) {
        await this.deleteFavorite(existingFavorite.id);
        return { favorited: false };
      }
      
      throw error;
    }
  },
};