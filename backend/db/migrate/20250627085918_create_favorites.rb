class CreateFavorites < ActiveRecord::Migration[7.2]
  def change
    create_table :favorites do |t|
      t.string :user_identifier, null: false
      t.string :favoritable_type, null: false
      t.bigint :favoritable_id, null: false

      t.timestamps
    end

    add_index :favorites, [:favoritable_type, :favoritable_id]
    add_index :favorites, :user_identifier
    add_index :favorites, [:user_identifier, :favoritable_type, :favoritable_id], 
              unique: true, name: 'index_favorites_on_user_and_favoritable'
  end
end
