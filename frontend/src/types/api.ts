// API Response Types
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    per_page: number;
  };
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Recipe Types
export interface Recipe {
  id: number;
  name: string;
  description: string;
  video_url: string;
  views_count: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cooking_time: number;
  ingredients: string[];
  instructions: string[];
  created_at: string;
  updated_at: string;
}

// Store Types
export interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  business_hours: string;
  google_maps_url?: string;
  latitude: number;
  longitude: number;
  distance?: number;
  created_at: string;
  updated_at: string;
}

// Favorite Types
export interface Favorite {
  id: number;
  user_identifier: string;
  favoritable_type: 'Recipe' | 'Store';
  favoritable_id: number;
  favoritable: Recipe | Store;
  created_at: string;
  updated_at: string;
}

// User Types
export interface User {
  id: number;
  email: string;
  name: string;
  identifier: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  user: {
    email: string;
    name: string;
    password: string;
    password_confirmation: string;
  };
}

// Request Parameters
export interface RecipeSearchParams {
  q?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  cooking_time?: number;
  cooking_time_max?: number; // 調理時間上限フィルター
  category?: string; // カテゴリーフィルター（クラシック、アレンジ、ヴィーガン等）
  ingredients_include?: string[]; // 含む材料
  ingredients_exclude?: string[]; // 除外する材料
  page?: number;
  per_page?: number;
}

export interface StoreSearchParams {
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  per_page?: number;
}

export interface FavoriteCreateParams {
  user_identifier?: string; // Optional now since we use JWT
  favoritable_type: 'Recipe' | 'Store';
  favoritable_id: number;
}