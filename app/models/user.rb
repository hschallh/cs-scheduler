class User < ApplicationRecord
    validates_uniqueness_of :email
    has_secure_password
    has_many :schedules, dependent: :destroy
    validates :email, presence: true
    validates :name, presence: true
end
