import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recipeService } from '../services/recipeService';
import type { RecipeSearchParams } from '../types/api';

export const useRecipes = (params?: RecipeSearchParams) => {
  return useQuery({
    queryKey: ['recipes', params],
    queryFn: () => recipeService.getRecipes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRecipe = (id: number) => {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: () => recipeService.getRecipe(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useIncrementRecipeView = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => recipeService.incrementView(id),
    onSuccess: (data) => {
      // Update cache with new view count
      queryClient.setQueryData(['recipe', data.id], data);
      
      // Optionally invalidate the recipes list to reflect updated view counts
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};