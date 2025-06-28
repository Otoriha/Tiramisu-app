import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteService } from '../services/favoriteService';
import type { FavoriteCreateParams } from '../types/api';

// TODO: This should come from a proper auth context
const getUserIdentifier = () => {
  // For now, use a temporary identifier from localStorage
  const identifier = localStorage.getItem('user_identifier');
  if (!identifier) {
    const newIdentifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('user_identifier', newIdentifier);
    return newIdentifier;
  }
  return identifier;
};

export const useFavorites = () => {
  const queryClient = useQueryClient();
  const userIdentifier = getUserIdentifier();
  
  const query = useQuery({
    queryKey: ['favorites', userIdentifier],
    queryFn: () => favoriteService.getFavorites(userIdentifier),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (params: Omit<FavoriteCreateParams, 'user_identifier'>) => 
      favoriteService.createFavorite({ ...params, user_identifier: userIdentifier }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', userIdentifier] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => favoriteService.deleteFavorite(id, userIdentifier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', userIdentifier] });
    },
  });

  return {
    ...query,
    createMutation,
    deleteMutation
  };
};

// Standalone mutations for when you need them separately
export const useCreateFavorite = () => {
  const queryClient = useQueryClient();
  const userIdentifier = getUserIdentifier();

  return useMutation({
    mutationFn: (params: Omit<FavoriteCreateParams, 'user_identifier'>) => 
      favoriteService.createFavorite({ ...params, user_identifier: userIdentifier }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', userIdentifier] });
    },
  });
};

export const useDeleteFavorite = () => {
  const queryClient = useQueryClient();
  const userIdentifier = getUserIdentifier();

  return useMutation({
    mutationFn: (id: number) => favoriteService.deleteFavorite(id, userIdentifier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', userIdentifier] });
    },
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  const userIdentifier = getUserIdentifier();

  return useMutation({
    mutationFn: (params: Omit<FavoriteCreateParams, 'user_identifier'>) => 
      favoriteService.toggleFavorite({ ...params, user_identifier: userIdentifier }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', userIdentifier] });
    },
  });
};