class Schedule < ApplicationRecord
  belongs_to :user

  validates :name, presence: true
  validates :is_public, presence: true
  validates :use_165, presence: true
  validates :start_quarter, presence: true
  validates :representation, presence: true
end
