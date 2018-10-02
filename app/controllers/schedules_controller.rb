class SchedulesController < ApplicationController
    before_action :authorize, only: [:create]

    def new
        @user = current_user
        @schedule = Schedule.new
        @editable = true
    end

    def show
        @user = current_user
        @schedule = Schedule.find_by_id(params[:id])
        @editable = true
        if @schedule.nil?
            flash.now[:warning] = "Schedule does not exist"
            @schedule = Schedule.new
            redirect_to new_schedule_path
        elsif !@schedule.is_public and (!@user or @user.id != @schedule.user_id)
            flash.now[:warning] = "This schedule is not public"
            @schedule = Schedule.new
            redirect_to new_schedule_path
        elsif @user and @user.id == @schedule.user_id
            render :show
        else
            @editable = false
            render :show
        end
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

    def update
        @user = current_user
        @schedule = Schedule.find_by_id(params[:id])
        @editable = true
        if @schedule.nil?
            flash.now[:warning] = "Schedule does not exist"
            @schedule = Schedule.new
            redirect_to new_schedule_path
        elsif @user and @user.id == @schedule.user_id
            if @schedule.update(schedule_params)
                flash[:success] = "Schedule updated"
                redirect_to(@schedule)
            else
                flash[:warning] = "Schedule could not be updated"
                redirect_to(@schedule)
            end
        else
            flash[:warning] = "Cannot update a schedule that is not yours"
            if @schedule.is_public
                redirect_to(@schedule)
            else 
                @schedule = Schedule.new
                redirect_to new_schedule_path
            end
        end
    end

    def destroy
        @user = current_user
        @schedule = Schedule.find_by_id(params[:id])
        @editable = true
        if @schedule.nil?
            flash.now[:warning] = "Schedule does not exist"
            @schedule = Schedule.new
            redirect_to new_schedule_path
        elsif @user and @user.id == @schedule.user_id
            @schedule.destroy
            flash[:success] = "Schedule deleted"
            redirect_to profile_path
        else
            flash[:warning] = "Cannot delete a schedule that is not yours"
            if @schedule.is_public
                redirect_to(@schedule)
            else
                @schedule = Schedule.new
                redirect_to new_schedule_path
            end
        end
    end

    private
        def schedule_params
            params.require(:schedule).permit(:name, :is_public, :use_165, :start_quarter, :representation)
        end
end
