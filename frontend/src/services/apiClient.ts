import type { ApiError } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export class ApiException extends Error {
  constructor(
    public status: number,
    public apiError: ApiError
  ) {
    super(apiError.message);
    this.name = 'ApiException';
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

export const apiClient = {
  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options;

    // Build URL with query parameters
    let fullUrl: string;
    if (API_BASE_URL.startsWith('http')) {
      // 絶対URL
      fullUrl = `${API_BASE_URL}${endpoint}`;
    } else {
      // 相対URL（プロキシ経由）
      fullUrl = `${window.location.origin}${API_BASE_URL}${endpoint}`;
    }
    
    const url = new URL(fullUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Default headers
    const headers = new Headers(fetchOptions.headers);
    if (!headers.has('Content-Type') && fetchOptions.body) {
      headers.set('Content-Type', 'application/json');
    }

    // Add JWT token if available
    const token = localStorage.getItem('tiramisu_auth_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    try {
      const response = await fetch(url.toString(), {
        ...fetchOptions,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json() as ApiError;
        throw new ApiException(response.status, errorData);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }

      // Network errors
      if (error instanceof Error) {
        throw new ApiException(0, {
          message: `ネットワークエラー: ${error.message}`,
          status: 0,
        });
      }

      throw new ApiException(0, {
        message: '予期しないエラーが発生しました',
        status: 0,
      });
    }
  },

  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};