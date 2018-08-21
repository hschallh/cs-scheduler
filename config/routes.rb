Rails.application.routes.draw do
    # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
    root to: 'pages#index'
    root 'welcome#index'
    resources :users, only: [:new, :create]
    resources :sessions, only: [:new, :create]
    
    delete '/logout', to: 'sessions#destroy', as: :logout
end

