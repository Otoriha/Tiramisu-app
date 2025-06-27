class Store < ApplicationRecord
  # Associations
  has_many :favorites, as: :favoritable, dependent: :destroy

  # Validations
  validates :name, presence: true
  validates :address, presence: true
  validates :latitude, presence: true, 
            numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }
  validates :longitude, presence: true,
            numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }
  validates :google_place_id, uniqueness: true, allow_nil: true
  validates :rating, numericality: { 
    greater_than_or_equal_to: 0, 
    less_than_or_equal_to: 5 
  }, allow_nil: true
  validates :review_count, numericality: { greater_than_or_equal_to: 0 }
  validates :price_level, inclusion: { in: 1..4 }, allow_nil: true

  # Scopes
  scope :by_rating, ->(min_rating) { where('rating >= ?', min_rating) }
  scope :by_price_level, ->(price_level) { where(price_level: price_level) }
  scope :with_reviews, -> { where('review_count > 0') }
  
  # Geolocation scopes - using basic SQL for compatibility
  scope :nearby, ->(lat, lng, distance_km = 5) {
    # Haversine formula in SQL
    select("*, (
      6371 * acos(
        cos(radians(#{lat})) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians(#{lng})) + 
        sin(radians(#{lat})) * sin(radians(latitude))
      )
    ) AS distance_km")
    .where("(
      6371 * acos(
        cos(radians(?)) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians(?)) + 
        sin(radians(?)) * sin(radians(latitude))
      )
    ) <= ?", lat, lng, lat, distance_km)
    .order('distance_km ASC')
  }

  # Methods
  def coordinates
    [latitude, longitude]
  end

  def price_level_label
    return nil unless price_level
    '¥' * price_level
  end

  def has_tiramisu?
    # これは将来的にメニュー情報から判定する
    true
  end

  def distance_from(lat, lng)
    # Haversine formula for distance calculation
    rad_per_deg = Math::PI / 180
    rkm = 6371 # Earth radius in kilometers
    
    dlat_rad = (lat - latitude) * rad_per_deg
    dlon_rad = (lng - longitude) * rad_per_deg
    
    lat1_rad = latitude * rad_per_deg
    lat2_rad = lat * rad_per_deg
    
    a = Math.sin(dlat_rad / 2)**2 + 
        Math.cos(lat1_rad) * Math.cos(lat2_rad) * 
        Math.sin(dlon_rad / 2)**2
    c = 2 * Math::atan2(Math::sqrt(a), Math::sqrt(1 - a))
    
    rkm * c
  end
end
