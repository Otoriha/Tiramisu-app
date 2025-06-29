import { apiClient } from './apiClient';
import type { Store, StoreSearchParams, ApiResponse } from '../types/api';

export const storeService = {
  async getStores(params?: StoreSearchParams): Promise<ApiResponse<Store[]>> {
    const response = await apiClient.get<any>('/stores', { 
      params: params as Record<string, string | number | undefined>
    });
    
    // バックエンドのレスポンス構造に合わせて変換
    return {
      data: response.stores || response.data || [],
      meta: response.meta
    };
  },

  async getStore(id: number): Promise<Store> {
    return apiClient.get<Store>(`/stores/${id}`);
  },

  async getNearbyStores(latitude: number, longitude: number, radius = 10): Promise<ApiResponse<Store[]>> {
    return this.getStores({ latitude, longitude, radius });
  },
};