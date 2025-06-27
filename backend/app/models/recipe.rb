class Recipe < ApplicationRecord
  # Associations
  has_many :favorites, as: :favoritable, dependent: :destroy

  # Validations
  validates :title, presence: true
  validates :source_id, uniqueness: { scope: :source_type }, allow_nil: true
  validates :difficulty, inclusion: { in: %w[easy medium hard] }, allow_nil: true
  validates :category, inclusion: { 
    in: %w[classic modern vegan gluten_free quick professional] 
  }, allow_nil: true
  validates :duration, numericality: { greater_than: 0 }, allow_nil: true
  validates :view_count, numericality: { greater_than_or_equal_to: 0 }

  # Scopes
  scope :by_difficulty, ->(difficulty) { where(difficulty: difficulty) }
  scope :by_category, ->(category) { where(category: category) }
  scope :by_duration, ->(max_duration) { where('duration <= ?', max_duration) }
  scope :popular, -> { order(view_count: :desc) }
  scope :recent, -> { order(published_at: :desc) }

  # Serialize fields
  serialize :ingredients, coder: JSON, type: Array
  serialize :instructions, coder: JSON, type: Array

  # Methods
  def increment_view_count!
    increment!(:view_count)
  end

  def duration_in_minutes
    duration
  end

  def difficulty_label
    {
      'easy' => '簡単',
      'medium' => '普通',
      'hard' => '本格派'
    }[difficulty] || difficulty
  end

  def category_label
    {
      'classic' => 'クラシック',
      'modern' => 'モダン',
      'vegan' => 'ヴィーガン',
      'gluten_free' => 'グルテンフリー',
      'quick' => 'クイック',
      'professional' => 'プロフェッショナル'
    }[category] || category
  end
end
