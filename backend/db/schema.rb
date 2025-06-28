# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2025_06_28_014800) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "favorites", force: :cascade do |t|
    t.string "user_identifier", null: false
    t.string "favoritable_type", null: false
    t.bigint "favoritable_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["favoritable_type", "favoritable_id"], name: "index_favorites_on_favoritable_type_and_favoritable_id"
    t.index ["user_identifier", "favoritable_type", "favoritable_id"], name: "index_favorites_on_user_and_favoritable", unique: true
    t.index ["user_identifier"], name: "index_favorites_on_user_identifier"
  end

  create_table "recipes", force: :cascade do |t|
    t.string "title", null: false
    t.text "description"
    t.string "thumbnail_url"
    t.string "video_url"
    t.integer "duration"
    t.string "difficulty"
    t.string "category"
    t.text "ingredients"
    t.text "instructions"
    t.string "source_type"
    t.string "source_id"
    t.datetime "published_at"
    t.integer "view_count", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "source_url"
    t.index ["category"], name: "index_recipes_on_category"
    t.index ["difficulty"], name: "index_recipes_on_difficulty"
    t.index ["source_type", "source_id"], name: "index_recipes_on_source_type_and_source_id", unique: true
    t.index ["title"], name: "index_recipes_on_title"
  end

  create_table "stores", force: :cascade do |t|
    t.string "name", null: false
    t.string "address", null: false
    t.decimal "latitude", precision: 10, scale: 7
    t.decimal "longitude", precision: 10, scale: 7
    t.string "phone_number"
    t.string "website_url"
    t.text "opening_hours"
    t.string "google_place_id"
    t.decimal "rating", precision: 2, scale: 1
    t.integer "review_count", default: 0
    t.integer "price_level"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["google_place_id"], name: "index_stores_on_google_place_id", unique: true
    t.index ["latitude", "longitude"], name: "index_stores_on_latitude_and_longitude"
    t.index ["name"], name: "index_stores_on_name"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "name", null: false
    t.string "password_digest", null: false
    t.string "identifier", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["identifier"], name: "index_users_on_identifier", unique: true
  end
end
