module Api
  module V1
    class StoresController < BaseController
      before_action :set_store, only: [:show]

      # GET /api/v1/stores
      def index
        @stores = Store.all
        @stores = apply_filters(@stores)
        @stores = @stores.page(params[:page]).per(params[:per_page] || 20)

        render json: {
          stores: serialize_stores(@stores),
          meta: pagination_meta(@stores)
        }
      end

      # GET /api/v1/stores/:id
      def show
        render json: {
          store: serialize_store(@store)
        }
      end

      # GET /api/v1/stores/nearby
      def nearby
        lat = params[:latitude]&.to_f
        lng = params[:longitude]&.to_f
        
        if lat.blank? || lng.blank?
          return render_error('緯度と経度を指定してください', :bad_request)
        end

        distance_km = params[:distance]&.to_f || 5.0
        
        # Haversine formulaを使用した距離検索
        @stores = Store.nearby(lat, lng, distance_km)
        
        @stores = apply_filters(@stores)
        @stores = @stores.page(params[:page]).per(params[:per_page] || 20)

        render json: {
          stores: serialize_stores_with_distance(@stores),
          meta: pagination_meta(@stores),
          search_location: {
            latitude: lat,
            longitude: lng,
            distance_km: distance_km
          }
        }
      end

      private

      def set_store
        @store = Store.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_error('店舗が見つかりません', :not_found)
      end

      def apply_filters(stores)
        # 評価でフィルター
        if params[:min_rating].present?
          stores = stores.by_rating(params[:min_rating].to_f)
        end

        # 価格帯でフィルター
        if params[:price_level].present?
          stores = stores.by_price_level(params[:price_level].to_i)
        end

        # レビューがある店舗のみ
        if params[:with_reviews].to_s == 'true'
          stores = stores.with_reviews
        end

        stores
      end

      def serialize_store(store)
        {
          id: store.id,
          name: store.name,
          address: store.address,
          latitude: store.latitude.to_f,
          longitude: store.longitude.to_f,
          phone_number: store.phone_number,
          website_url: store.website_url,
          opening_hours: store.opening_hours,
          google_place_id: store.google_place_id,
          rating: store.rating&.to_f,
          review_count: store.review_count,
          price_level: store.price_level,
          price_level_label: store.price_level_label,
          has_tiramisu: store.has_tiramisu?,
          created_at: store.created_at,
          favorited: favorited?(store)
        }
      end

      def serialize_stores(stores)
        stores.map { |store| serialize_store(store) }
      end

      def serialize_stores_with_distance(stores)
        stores.map do |store|
          serialize_store(store).merge(
            distance_km: store.distance_km.round(2)
          )
        end
      end

      def favorited?(store)
        return false unless params[:user_identifier].present?
        
        Favorite.favorited?(params[:user_identifier], store)
      end
    end
  end
end