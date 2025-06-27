module Api
  module V1
    class BaseController < ApplicationController
      # JSONレスポンスのみを返す
      before_action :set_default_format

      private

      def set_default_format
        request.format = :json
      end

      # ページネーション用のメタデータを生成
      def pagination_meta(collection)
        {
          current_page: collection.current_page,
          total_pages: collection.total_pages,
          total_count: collection.total_count,
          per_page: collection.limit_value
        }
      end

      # エラーレスポンスを返す
      def render_error(message, status = :unprocessable_entity)
        render json: { error: message }, status: status
      end

      # 成功レスポンスを返す
      def render_success(data, status = :ok)
        render json: data, status: status
      end
    end
  end
end