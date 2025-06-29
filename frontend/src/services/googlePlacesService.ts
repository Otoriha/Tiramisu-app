// Google Places APIサービス
export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  formatted_phone_number?: string;
  website?: string;
  photos?: Array<{
    getUrl: (options: { maxWidth: number }) => string;
  }>;
  types?: string[];
}

class GooglePlacesService {
  private service: any;

  // Places Serviceの初期化
  async initializeService(map: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.maps) {
        reject(new Error('Google Maps APIが読み込まれていません'));
        return;
      }

      try {
        this.service = new (window as any).google.maps.places.PlacesService(map);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // 周辺のティラミス関連店舗を検索
  async searchNearbyTiramisuShops(
    location: { lat: number; lng: number },
    radius: number = 5000 // メートル単位
  ): Promise<PlaceResult[]> {
    if (!this.service) {
      throw new Error('Places Serviceが初期化されていません');
    }

    // ティラミスに関連するキーワード
    const tiramisuKeywords = [
      'ティラミス',
      'tiramisu',
      'イタリアン デザート',
      'イタリアン カフェ',
      'ケーキ屋 ティラミス',
      'パティスリー'
    ];

    const allResults: PlaceResult[] = [];

    // 各キーワードで検索
    for (const keyword of tiramisuKeywords) {
      try {
        const results = await this.nearbySearch({
          location: new (window as any).google.maps.LatLng(location.lat, location.lng),
          radius: radius,
          keyword: keyword,
          type: 'cafe|bakery|restaurant'
        });
        
        // 重複を避けるため、place_idでフィルタリング
        results.forEach(place => {
          if (!allResults.find(p => p.place_id === place.place_id)) {
            allResults.push(place);
          }
        });
      } catch (error) {
        console.error(`検索エラー (${keyword}):`, error);
      }
    }

    // 評価順でソート
    return allResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  // Places APIのnearbySearch
  private nearbySearch(request: any): Promise<PlaceResult[]> {
    return new Promise((resolve, reject) => {
      this.service.nearbySearch(request, (results: PlaceResult[], status: any) => {
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK) {
          resolve(results || []);
        } else if (status === (window as any).google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve([]);
        } else {
          reject(new Error(`Places API エラー: ${status}`));
        }
      });
    });
  }

  // 店舗の詳細情報を取得
  async getPlaceDetails(placeId: string): Promise<PlaceResult> {
    if (!this.service) {
      throw new Error('Places Serviceが初期化されていません');
    }

    return new Promise((resolve, reject) => {
      const request = {
        placeId: placeId,
        fields: [
          'name',
          'formatted_address',
          'geometry',
          'rating',
          'user_ratings_total',
          'price_level',
          'opening_hours',
          'formatted_phone_number',
          'website',
          'photos',
          'types'
        ]
      };

      this.service.getDetails(request, (place: PlaceResult, status: any) => {
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK) {
          resolve(place);
        } else {
          reject(new Error(`Place Details API エラー: ${status}`));
        }
      });
    });
  }

  // PlaceResultをStore型に変換
  convertToStore(place: PlaceResult): any {
    const store = {
      id: place.place_id, // 一時的にplace_idを使用
      name: place.name,
      address: place.formatted_address || '住所情報なし',
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
      phone_number: place.formatted_phone_number,
      website_url: place.website,
      opening_hours: place.opening_hours?.weekday_text?.join('\n'),
      google_place_id: place.place_id,
      rating: place.rating,
      review_count: place.user_ratings_total,
      price_level: place.price_level,
      has_tiramisu: true, // ティラミス関連で検索したので
      photo_url: place.photos?.[0]?.getUrl({ maxWidth: 400 })
    };
    
    console.log('🏪 Store変換:', {
      name: store.name,
      address: store.address,
      original_address: place.formatted_address
    });
    
    return store;
  }
}

export const googlePlacesService = new GooglePlacesService();