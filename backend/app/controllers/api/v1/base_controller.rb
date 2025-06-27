module Api
  module V1
    class BaseController < ApplicationController
      # JSONレスポンスのみを返す
      before_action :set_default_format

      private

      def set_default_format
        request.format = :json
      end

      # JWT認証
      def authenticate_request
        header = request.headers['Authorization']
        if header.present?
          token = header.split(' ').last
          begin
            decoded = JWT.decode(token, Rails.application.credentials.secret_key_base, true, { algorithm: 'HS256' })
            @current_user = User.find(decoded[0]['user_id'])
          rescue JWT::ExpiredSignature
            render json: { message: 'トークンの有効期限が切れています' }, status: :unauthorized
          rescue JWT::DecodeError
            render json: { message: '無効なトークンです' }, status: :unauthorized
          rescue ActiveRecord::RecordNotFound
            render json: { message: 'ユーザーが見つかりません' }, status: :unauthorized
          end
        else
          render json: { message: 'トークンが提供されていません' }, status: :unauthorized
        end
      end

      def current_user
        @current_user
      end

      # オプショナル認証（トークンがあれば認証、なくても通す）
      def optional_authenticate
        header = request.headers['Authorization']
        if header.present?
          token = header.split(' ').last
          begin
            decoded = JWT.decode(token, Rails.application.credentials.secret_key_base, true, { algorithm: 'HS256' })
            @current_user = User.find(decoded[0]['user_id'])
          rescue JWT::ExpiredSignature, JWT::DecodeError, ActiveRecord::RecordNotFound
            # エラーでも処理を続行
            @current_user = nil
          end
        end
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