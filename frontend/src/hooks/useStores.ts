import { useQuery } from '@tanstack/react-query';
import { storeService } from '../services/storeService';
import type { StoreSearchParams } from '../types/api';

export const useStores = (params?: StoreSearchParams) => {
  return useQuery({
    queryKey: ['stores', params],
    queryFn: () => storeService.getStores(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStore = (id: number) => {
  return useQuery({
    queryKey: ['store', id],
    queryFn: () => storeService.getStore(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useNearbyStores = (latitude?: number, longitude?: number, radius = 10) => {
  return useQuery({
    queryKey: ['stores', 'nearby', latitude, longitude, radius],
    queryFn: () => storeService.getNearbyStores(latitude!, longitude!, radius),
    enabled: !!latitude && !!longitude,
    staleTime: 5 * 60 * 1000,
  });
};