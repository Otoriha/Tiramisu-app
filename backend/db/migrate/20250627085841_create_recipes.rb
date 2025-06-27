class CreateRecipes < ActiveRecord::Migration[7.2]
  def change
    create_table :recipes do |t|
      t.string :title, null: false
      t.text :description
      t.string :thumbnail_url
      t.string :video_url
      t.integer :duration
      t.string :difficulty
      t.string :category
      t.text :ingredients
      t.text :instructions
      t.string :source_type
      t.string :source_id
      t.datetime :published_at
      t.integer :view_count, default: 0

      t.timestamps
    end

    add_index :recipes, :title
    add_index :recipes, :difficulty
    add_index :recipes, :category
    add_index :recipes, [:source_type, :source_id], unique: true
  end
end
