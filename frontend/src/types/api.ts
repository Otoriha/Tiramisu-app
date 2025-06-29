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
  title: string;
  description: string;
  thumbnail_url?: string;
  video_url: string;
  view_count: number;
  difficulty: 'easy' | 'medium' | 'hard';
  difficulty_label: string;
  duration: number;
  category: string;
  category_label: string;
  ingredients: string[];
  instructions: string[];
  published_at: string;
  created_at: string;
  updated_at: string;
  favorited: boolean;
}

// Store Types
export interface Store {
  id: number;
  name: string;
  address: string;
  phone_number?: string;
  phone?: string; // エイリアス用
  website_url?: string;
  opening_hours?: string;
  business_hours?: string; // エイリアス用
  google_maps_url?: string;
  latitude: number;
  longitude: number;
  distance?: number;
  distance_km?: number; // バックエンド用
  rating?: number;
  review_count?: number;
  price_level?: number;
  price_level_label?: string;
  google_place_id?: string;
  has_tiramisu?: boolean;
  favorited?: boolean;
  created_at: string;
  updated_at?: string;
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
  max_duration?: number; // 調理時間上限フィルター
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