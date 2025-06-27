Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # API routes
  namespace :api do
    namespace :v1 do
      resources :recipes, only: [:index, :show] do
        collection do
          get :search
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
