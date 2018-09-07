class UsersController < ApplicationController
    before_action :authorize, only: :show

    def new
        @user = User.new
    end

    def show
        @user = current_user
    end
  
    def create
        @user = User.new(user_params)
        if @user.save
            session[:user_id] = @user.id
            flash.now[:success] = "Welcome!"
            render :show
        else
            render :new
        end
    end
  
    private
        def user_params
            params.require(:user).permit(:email, :name, :password, :password_confirmation)
        end
  end