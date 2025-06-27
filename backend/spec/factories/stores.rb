FactoryBot.define do
  factory :store do
    name { "MyString" }
    address { "MyString" }
    latitude { "9.99" }
    longitude { "9.99" }
    phone_number { "MyString" }
    website_url { "MyString" }
    opening_hours { "MyText" }
    google_place_id { "MyString" }
    rating { "9.99" }
    review_count { 1 }
    price_level { 1 }
  end
end
