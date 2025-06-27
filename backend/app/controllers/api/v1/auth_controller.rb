class Api::V1::AuthController < Api::V1::BaseController
  before_action :authenticate_request, only: [:me, :refresh]

  def register
    @user = User.new(user_params)
    
    if @user.save
      token = generate_token(@user.id)
      render json: {
        user: user_data(@user),
        token: token
      }, status: :created
    else
      render json: { 
        message: 'ユーザー登録に失敗しました',
        errors: @user.errors 
      }, status: :unprocessable_entity
    end
  end

  def login
    @user = User.find_by(email: params[:email].downcase)
    
    if @user&.authenticate(params[:password])
      token = generate_token(@user.id)
      render json: {
        user: user_data(@user),
        token: token
      }
    else
      render json: { 
        message: 'メールアドレスまたはパスワードが正しくありません' 
      }, status: :unauthorized
    end
  end

  def me
    render json: { user: user_data(current_user) }
  end

  def refresh
    token = generate_token(current_user.id)
    render json: { token: token }
  end

  private

  def user_params
    params.require(:user).permit(:email, :name, :password, :password_confirmation)
  end

  def user_data(user)
    {
      id: user.id,
      email: user.email,
      name: user.name,
      identifier: user.identifier,
      created_at: user.created_at
    }
  end

  def generate_token(user_id)
    payload = {
      user_id: user_id,
      exp: 24.hours.from_now.to_i
    }
    
    JWT.encode(payload, Rails.application.credentials.secret_key_base)
  end
end