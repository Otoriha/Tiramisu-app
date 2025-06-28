Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # API routes
  namespace :api do
    namespace :v1 do
      # 認証
      post '/auth/register', to: 'auth#register'
      post '/auth/login', to: 'auth#login'
      get '/auth/me', to: 'auth#me'
      post '/auth/refresh', to: 'auth#refresh'

      resources :recipes do
        collection do
          get :search
          post :bulk_import
        end
        member do
          post :increment_view
        end
      end

      resources :stores, only: [:index, :show] do
        collection do
          get :nearby
        end
      end

      resources :favorites, only: [:index, :create, :destroy]
    end
  end

  # Defines the root path route ("/")
  # root "posts#index"
end
