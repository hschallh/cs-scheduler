class SchedulesController < ApplicationController
    before_action :authorize, only: [:create, :destroy]

    def new
        @user = current_user
        @schedule = Schedule.new
    end

    def show
        @user = current_user
        @schedule = @user.schedules.find(params[:id])
    end

	def create
        @user = current_user
        @schedule = @user.schedules.create(schedule_params)
        if @schedule.save
            flash[:success] = "Schedule saved"
            redirect_to(@schedule)
        else
            flash.now[:warning] = "Schedule could not be saved"
            render :new
        end
    end

    def destroy
        @user = current_user
        @schedule = @user.schedules.find(params[:id])
        @schedule.destroy
        flash[:success] = "Schedule deleted"
        redirect_to profile_path
    end

    private
        def schedule_params
            params.require(:schedule).permit(:name, :is_public, :use_165, :start_quarter, :representation)
        end
end
