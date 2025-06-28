module Api
  module V1
    class RecipesController < BaseController
      before_action :set_recipe, only: [:show, :update, :destroy, :increment_view]

      # GET /api/v1/recipes
      def index
        @recipes = Recipe.all
        @recipes = apply_filters(@recipes)
        @recipes = @recipes.page(params[:page]).per(params[:per_page] || 12)

        render json: {
          data: serialize_recipes(@recipes),
          meta: pagination_meta(@recipes)
        }
      end

      # GET /api/v1/recipes/:id
      def show
        render json: serialize_recipe(@recipe)
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
          data: serialize_recipes(@recipes),
          meta: pagination_meta(@recipes),
          query: query
        }
      end

      # POST /api/v1/recipes
      def create
        @recipe = Recipe.new(recipe_params)
        
        if @recipe.save
          render json: serialize_recipe(@recipe), status: :created
        else
          render_error(@recipe.errors.full_messages.join(', '), :unprocessable_entity)
        end
      end

      # PUT /api/v1/recipes/:id
      def update
        if @recipe.update(recipe_params)
          render json: serialize_recipe(@recipe)
        else
          render_error(@recipe.errors.full_messages.join(', '), :unprocessable_entity)
        end
      end

      # DELETE /api/v1/recipes/:id
      def destroy
        @recipe.destroy
        head :no_content
      end

      # POST /api/v1/recipes/bulk_import
      def bulk_import
        recipes_data = params[:recipes]
        
        if recipes_data.blank?
          return render_error('レシピデータが必要です', :bad_request)
        end

        created_recipes = []
        errors = []

        recipes_data.each_with_index do |recipe_data, index|
          recipe = Recipe.new(recipe_data.permit(recipe_param_keys))
          
          if recipe.save
            created_recipes << recipe
          else
            errors << "Recipe #{index + 1}: #{recipe.errors.full_messages.join(', ')}"
          end
        end

        render json: {
          success: true,
          created_count: created_recipes.length,
          total_count: recipes_data.length,
          errors: errors,
          data: serialize_recipes(created_recipes)
        }
      end

      # POST /api/v1/recipes/:id/increment_view
      def increment_view
        @recipe.increment_view_count!
        render json: serialize_recipe(@recipe)
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

      def recipe_params
        params.require(:recipe).permit(recipe_param_keys)
      end

      def recipe_param_keys
        [
          :title, :description, :thumbnail_url, :video_url, :duration,
          :difficulty, :category, :source_type, :source_id, :published_at,
          ingredients: [], instructions: []
        ]
      end
    end
  end
end