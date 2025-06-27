import { apiClient } from './apiClient';
import type { Recipe, RecipeSearchParams, ApiResponse } from '../types/api';

export const recipeService = {
  async getRecipes(params?: RecipeSearchParams): Promise<ApiResponse<Recipe[]>> {
    return apiClient.get<ApiResponse<Recipe[]>>('/recipes', { params });
  },

  async getRecipe(id: number): Promise<Recipe> {
    return apiClient.get<Recipe>(`/recipes/${id}`);
  },

  async incrementView(id: number): Promise<Recipe> {
    return apiClient.post<Recipe>(`/recipes/${id}/increment_view`);
  },
};