import { apiClient } from './apiClient';
import type { Store, StoreSearchParams, ApiResponse } from '../types/api';

export const storeService = {
  async getStores(params?: StoreSearchParams): Promise<ApiResponse<Store[]>> {
    return apiClient.get<ApiResponse<Store[]>>('/stores', { 
      params: params as Record<string, string | number | undefined>
    });
  },

  async getStore(id: number): Promise<Store> {
    return apiClient.get<Store>(`/stores/${id}`);
  },

  async getNearbyStores(latitude: number, longitude: number, radius = 10): Promise<ApiResponse<Store[]>> {
    return this.getStores({ latitude, longitude, radius });
  },
};