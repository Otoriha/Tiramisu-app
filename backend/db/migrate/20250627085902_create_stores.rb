class CreateStores < ActiveRecord::Migration[7.2]
  def change
    create_table :stores do |t|
      t.string :name, null: false
      t.string :address, null: false
      t.decimal :latitude, precision: 10, scale: 7
      t.decimal :longitude, precision: 10, scale: 7
      t.string :phone_number
      t.string :website_url
      t.text :opening_hours
      t.string :google_place_id
      t.decimal :rating, precision: 2, scale: 1
      t.integer :review_count, default: 0
      t.integer :price_level

      t.timestamps
    end

    add_index :stores, :name
    add_index :stores, [:latitude, :longitude]
    add_index :stores, :google_place_id, unique: true
  end
end
