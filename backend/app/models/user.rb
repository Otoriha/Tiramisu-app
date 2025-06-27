class User < ApplicationRecord
  has_secure_password

  validates :email, presence: true, uniqueness: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :name, presence: true

  has_many :favorites, foreign_key: :user_identifier, primary_key: :identifier
  
  before_create :generate_identifier

  private

  def generate_identifier
    self.identifier = SecureRandom.hex(16) unless identifier.present?
  end
end