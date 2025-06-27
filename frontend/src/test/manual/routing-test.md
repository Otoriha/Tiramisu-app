# React Router 動作確認手順

## 確認項目

### 1. 基本ルーティング
- [ ] http://localhost:5173/ → ホームページが表示される
- [ ] http://localhost:5173/search → 検索ページが表示される
- [ ] http://localhost:5173/stores → 店舗マップページが表示される
- [ ] http://localhost:5173/favorites → お気に入りページが表示される
- [ ] http://localhost:5173/recipes/1 → レシピ詳細ページが表示される（ID: 1）
- [ ] http://localhost:5173/invalid-route → 404ページが表示される

### 2. ナビゲーション
- [ ] 各ページにナビゲーションバーが表示される
- [ ] ナビゲーションのリンクをクリックすると対応するページに遷移する
- [ ] 現在のページがアクティブ状態で表示される（オレンジ色の背景）

### 3. レスポンシブデザイン
- [ ] デスクトップサイズ：テキスト付きナビゲーション
- [ ] モバイルサイズ：アイコンのみのナビゲーション

### 4. 404ページ
- [ ] 存在しないURLにアクセスすると404ページが表示される
- [ ] 「ホームに戻る」ボタンが機能する

## 実装済みルート
- `/` - HomePage
- `/search` - SearchPage（既存の検索機能）
- `/stores` - StoreMapPage（プレースホルダー）
- `/favorites` - FavoritesPage（プレースホルダー）
- `/recipes/:id` - RecipeDetailPage（プレースホルダー）
- `*` - NotFoundPage（404）