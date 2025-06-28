module Api
  module V1
    class FavoritesController < BaseController
      before_action :require_user_identifier
      before_action :set_favoritable, only: [:create]

      # GET /api/v1/favorites
      def index
        @favorites = Favorite.for_user(params[:user_identifier])
                           .includes(:favoritable)
                           .recent
                           .page(params[:page])
                           .per(params[:per_page] || 20)

        render json: {
          favorites: serialize_favorites(@favorites),
          meta: pagination_meta(@favorites)
        }
      end

      # POST /api/v1/favorites
      def create
        result = Favorite.toggle_favorite(params[:user_identifier], @favoritable)
        
        if result[:favorited]
          render json: {
            message: 'お気に入りに追加しました',
            favorite: serialize_favorite(result[:favorite])
          }, status: :created
        else
          render json: {
            message: 'お気に入りから削除しました'
          }
        end
      end

      # DELETE /api/v1/favorites/:id
      def destroy
        @favorite = Favorite.for_user(params[:user_identifier]).find(params[:id])
        @favorite.destroy

        render json: {
          message: 'お気に入りから削除しました'
        }
      rescue ActiveRecord::RecordNotFound
        render_error('お気に入りが見つかりません', :not_found)
      end

      private

      def require_user_identifier
        if params[:user_identifier].blank?
          render_error('ユーザー識別子が必要です', :bad_request)
        end
      end

      def set_favoritable
        if params[:recipe_id].present?
          @favoritable = Recipe.find(params[:recipe_id])
        elsif params[:store_id].present?
          @favoritable = Store.find(params[:store_id])
        else
          render_error('レシピIDまたは店舗IDが必要です', :bad_request)
        end
      rescue ActiveRecord::RecordNotFound
        render_error('対象が見つかりません', :not_found)
      end

      def serialize_favorite(favorite)
        {
          id: favorite.id,
          favoritable_type: favorite.favoritable_type,
          favoritable_id: favorite.favoritable_id,
          favoritable: serialize_favoritable(favorite.favoritable),
          created_at: favorite.created_at
        }
      end

      def serialize_favorites(favorites)
        favorites.map { |favorite| serialize_favorite(favorite) }
      end

      def serialize_favoritable(favoritable)
        case favoritable
        when Recipe
          {
            id: favoritable.id,
            title: favoritable.title,
            thumbnail_url: favoritable.thumbnail_url,
            duration: favoritable.duration,
            difficulty: favoritable.difficulty,
            difficulty_label: favoritable.difficulty_label,
            category_label: favoritable.category_label,
            description: favoritable.description
          }
        when Store
          {
            id: favoritable.id,
            name: favoritable.name,
            address: favoritable.address,
            rating: favoritable.rating,
            price_level_label: favoritable.price_level_label
          }
        end
      end
    end
  end
end