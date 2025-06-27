class Favorite < ApplicationRecord
  # Associations
  belongs_to :favoritable, polymorphic: true

  # Validations
  validates :user_identifier, presence: true
  validates :user_identifier, uniqueness: { 
    scope: [:favoritable_type, :favoritable_id],
    message: 'はすでにお気に入りに追加されています'
  }

  # Scopes
  scope :for_user, ->(user_identifier) { where(user_identifier: user_identifier) }
  scope :recipes, -> { where(favoritable_type: 'Recipe') }
  scope :stores, -> { where(favoritable_type: 'Store') }
  scope :recent, -> { order(created_at: :desc) }

  # Class methods
  def self.toggle_favorite(user_identifier, favoritable)
    favorite = find_by(
      user_identifier: user_identifier,
      favoritable: favoritable
    )

    if favorite
      favorite.destroy
      { favorited: false, favorite: nil }
    else
      favorite = create!(
        user_identifier: user_identifier,
        favoritable: favoritable
      )
      { favorited: true, favorite: favorite }
    end
  end

  def self.favorited?(user_identifier, favoritable)
    exists?(
      user_identifier: user_identifier,
      favoritable: favoritable
    )
  end

  # Instance methods
  def recipe?
    favoritable_type == 'Recipe'
  end

  def store?
    favoritable_type == 'Store'
  end
end
