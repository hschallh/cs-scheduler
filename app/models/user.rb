class User < ApplicationRecord
    validates_uniqueness_of :email

    has_secure_password
    validates :email, presence: true
    validates :name, presence: true
end
