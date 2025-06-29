// Google Places APIサービス
export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  vicinity?: string; // nearbySearchで取得できる簡易住所
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
      'tiramisu'
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
        
        // 重複を避けるため、place_idでフィルタリング + types チェック
        results.forEach(place => {
          const isDuplicate = allResults.find(p => p.place_id === place.place_id);
          const isExcludedType = this.hasExcludedTypes(place);
          const isConvenience = this.isConvenienceStore(place);
          const isSupermarket = this.isSupermarket(place);
          
          if (isDuplicate) {
            console.log(`🔄 重複除外: ${place.name}`);
          } else if (isExcludedType) {
            console.log(`🚫 タイプ除外: ${place.name} (types: ${place.types?.join(', ')})`);
          } else if (isConvenience) {
            console.log(`🏪 コンビニ除外: ${place.name}`);
          } else if (isSupermarket) {
            console.log(`🛒 スーパー除外: ${place.name}`);
          } else {
            console.log(`✅ 追加: ${place.name} (types: ${place.types?.join(', ')})`);
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
      address: place.formatted_address || place.vicinity || '住所情報なし',
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
      formatted_address: place.formatted_address,
      vicinity: place.vicinity
    });
    
    return store;
  }

  // コンビニかどうかを判定
  private isConvenienceStore(place: PlaceResult): boolean {
    const name = place.name.toLowerCase();
    const convenienceStoreNames = [
      'セブンイレブン', 'セブン-イレブン', 'seven-eleven', '7-eleven', '7eleven',
      'ファミリーマート', 'familymart', 'ファミマ',
      'ローソン', 'lawson',
      'ミニストップ', 'ministop',
      'デイリーヤマザキ', 'daily yamazaki',
      'セイコーマート', 'seicomart',
      'ポプラ', 'poplar',
      'コンビニ', 'convenience store', 'コンビニエンスストア'
    ];
    
    return convenienceStoreNames.some(convenienceName => 
      name.includes(convenienceName.toLowerCase())
    );
  }

  // 除外すべきGoogle Places APIのタイプかどうかを判定
  private hasExcludedTypes(place: PlaceResult): boolean {
    if (!place.types) return false;
    
    const excludedTypes = [
      'supermarket',
      'convenience_store',
      'grocery_or_supermarket',
      'gas_station',
      'pharmacy',
      'shopping_mall',
      'department_store'
    ];
    
    return place.types.some(type => excludedTypes.includes(type));
  }

  // スーパーマーケットかどうかを判定
  private isSupermarket(place: PlaceResult): boolean {
    const name = place.name.toLowerCase();
    const supermarketNames = [
      'イオン', 'aeon',
      'イトーヨーカドー', 'ito yokado', 'ito-yokado',
      'マックスバリュ', 'maxvalu', 'max valu',
      'ライフ', 'life',
      'サミット', 'summit',
      'マルエツ', 'maruetsu',
      'ヤオコー', 'yaoko',
      'オーケー', 'ok store', 'ok',
      'コープ', 'coop', 'co-op',
      'ユニー', 'uny',
      '西友', 'seiyu',
      'ダイエー', 'daiei',
      'カスミ', 'kasumi',
      'ベイシア', 'beisia',
      'ピアゴ', 'piago',
      'アピタ', 'apita',
      'フジ', 'fuji',
      'マルショク', 'marusyoku',
      'バロー', 'valor',
      'ヨークベニマル', 'york benimaru',
      'ヨークマート', 'york mart',
      'フードワン', 'foodone',
      'ドン・キホーテ', 'don quijote', 'donki',
      'スーパー', 'supermarket', 'super market'
    ];
    
    return supermarketNames.some(supermarketName => 
      name.includes(supermarketName.toLowerCase())
    );
  }
}

export const googlePlacesService = new GooglePlacesService();