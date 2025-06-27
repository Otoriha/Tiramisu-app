FactoryBot.define do
  factory :recipe do
    title { "MyString" }
    description { "MyText" }
    thumbnail_url { "MyString" }
    video_url { "MyString" }
    duration { 1 }
    difficulty { "MyString" }
    category { "MyString" }
    ingredients { "MyText" }
    instructions { "MyText" }
    source_type { "MyString" }
    source_id { "MyString" }
    published_at { "2025-06-27 08:58:41" }
    view_count { 1 }
  end
end
