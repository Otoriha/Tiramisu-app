module Api
  module V1
    class RecipesController < BaseController
      before_action :set_recipe, only: [:show]

      # GET /api/v1/recipes
      def index
        @recipes = Recipe.all
        @recipes = apply_filters(@recipes)
        @recipes = @recipes.page(params[:page]).per(params[:per_page] || 12)

        render json: {
          recipes: serialize_recipes(@recipes),
          meta: pagination_meta(@recipes)
        }
      end

      # GET /api/v1/recipes/:id
      def show
        # 閲覧数をインクリメント
        @recipe.increment_view_count!

        render json: {
          recipe: serialize_recipe(@recipe)
        }
      end

      # GET /api/v1/recipes/search
      def search
        query = params[:q]
        
        if query.blank?
          return render_error('検索キーワードを入力してください', :bad_request)
        end

        @recipes = Recipe.where('title ILIKE ? OR description ILIKE ?', "%#{query}%", "%#{query}%")
        @recipes = apply_filters(@recipes)
        @recipes = @recipes.page(params[:page]).per(params[:per_page] || 12)

        render json: {
          recipes: serialize_recipes(@recipes),
          meta: pagination_meta(@recipes),
          query: query
        }
      end

      private

      def set_recipe
        @recipe = Recipe.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_error('レシピが見つかりません', :not_found)
      end

      def apply_filters(recipes)
        # 難易度でフィルター
        if params[:difficulty].present?
          recipes = recipes.by_difficulty(params[:difficulty])
        end

        # カテゴリーでフィルター
        if params[:category].present?
          recipes = recipes.by_category(params[:category])
        end

        # 調理時間でフィルター
        if params[:max_duration].present?
          recipes = recipes.by_duration(params[:max_duration].to_i)
        end

        # ソート
        case params[:sort]
        when 'popular'
          recipes = recipes.popular
        when 'recent'
          recipes = recipes.recent
        else
          recipes = recipes.recent
        end

        recipes
      end

      def serialize_recipe(recipe)
        {
          id: recipe.id,
          title: recipe.title,
          description: recipe.description,
          thumbnail_url: recipe.thumbnail_url,
          video_url: recipe.video_url,
          duration: recipe.duration,
          difficulty: recipe.difficulty,
          difficulty_label: recipe.difficulty_label,
          category: recipe.category,
          category_label: recipe.category_label,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          view_count: recipe.view_count,
          published_at: recipe.published_at,
          created_at: recipe.created_at,
          favorited: favorited?(recipe)
        }
      end

      def serialize_recipes(recipes)
        recipes.map { |recipe| serialize_recipe(recipe) }
      end

      def favorited?(recipe)
        return false unless params[:user_identifier].present?
        
        Favorite.favorited?(params[:user_identifier], recipe)
      end
    end
  end
end