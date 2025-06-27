FactoryBot.define do
  factory :favorite do
    user_identifier { "MyString" }
    favoritable_type { "MyString" }
    favoritable_id { 1 }
  end
end
