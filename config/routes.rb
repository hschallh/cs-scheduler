Rails.application.routes.draw do
    # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
    root to: 'schedules#new'
    resources :users, only: [:create]
    resources :schedules
    resources :sessions, only: [:create]
    

    get 'profile', to: 'users#show'
    get 'register', to: 'users#new'
    get 'login', to: 'sessions#new'
    delete 'logout', to: 'sessions#destroy', as: :logout
end

