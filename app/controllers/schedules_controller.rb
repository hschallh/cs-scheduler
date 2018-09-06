class SchedulesController < ApplicationController
    before_action :authorize, only: [:create, :destroy]

    def new
        @user = current_user
        @schedule = Schedule.new
    end

    def show
    end

	def create
        @user = current_user
        @schedule = @user.schedules.create(schedule_params)
        if @schedule.save
            flash[:success] = "Schedule Saved!"
            render :show
        else
            render :new
        end
    end

    def destroy
        @user = User.find(params[:user_id])
        @schedule = @user.schedules.find(params[:id])
        @schedule.destroy
        redirect_to user_path(@user)
    end

    private
        def schedule_params
            params.require(:schedule).permit(:name, :is_public, :use_165, :start_quarter, :representation)
        end
end
