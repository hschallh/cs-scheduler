class CreateSchedules < ActiveRecord::Migration[5.2]
  def change
    create_table :schedules do |t|
      t.string :name
      t.boolean :is_public
      t.boolean :use_165
      t.date :start_quarter
      t.string :representation
      t.references :user, foreign_key: true

      t.timestamps
    end
  end
end
