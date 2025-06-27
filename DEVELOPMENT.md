# Tiramisu App - 開発環境構築・運用ガイド

## 開発環境の構築

### 1. 初回セットアップ

```bash
# リポジトリをクローン
git clone <repository-url>
cd tiramisu-app

# Docker環境でコンテナをビルドして起動
docker-compose up --build

# または個別にビルド
docker-compose build
docker-compose up
```

### 2. 依存関係の管理

#### フロントエンド依存関係の追加

```bash
# コンテナ内で実行（推奨）
docker-compose exec frontend npm install <package-name>

# または、ホスト側でinstall後にコンテナを再ビルド
cd frontend
npm install <package-name>
docker-compose build frontend
```

#### バックエンド依存関係の追加

```bash
# コンテナ内で実行
docker-compose exec backend bundle add <gem-name>

# または、ホスト側でadd後にコンテナを再ビルド
cd backend
bundle add <gem-name>
docker-compose build backend
```

### 3. 環境変数の設定

#### フロントエンド（frontend/.env.local）

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
```

#### バックエンド（backend/.env.local）

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/tiramisu_app_development
YOUTUBE_API_KEY=your_youtube_api_key_here
CORS_ORIGINS=http://localhost:5173
```

## 開発ワークフロー

### 1. 新機能開発のブランチ戦略

```bash
# 最新のmainブランチに移動
git checkout main
git pull origin main

# Issue番号付きのfeatureブランチを作成
git checkout -b feature/issue-XX-feature-name

# 開発作業...

# コミット・プッシュ
git add .
git commit -m "feat: implement feature description"
git push origin feature/issue-XX-feature-name

# Pull Requestを作成してmainブランチにマージ
```

### 2. 開発サーバーの起動・停止

```bash
# 全サービスを起動
docker-compose up

# バックグラウンドで起動
docker-compose up -d

# 特定のサービスのみ起動
docker-compose up frontend
docker-compose up backend

# サービスを停止
docker-compose down

# コンテナとボリュームを削除
docker-compose down -v
```

### 3. ログの確認

```bash
# 全サービスのログ
docker-compose logs -f

# 特定のサービスのログ
docker-compose logs -f frontend
docker-compose logs -f backend
```

### 4. コンテナ内でのコマンド実行

```bash
# フロントエンド
docker-compose exec frontend npm run test
docker-compose exec frontend npm run lint
docker-compose exec frontend npm run build

# バックエンド
docker-compose exec backend rails console
docker-compose exec backend rails db:migrate
docker-compose exec backend rails db:seed
docker-compose exec backend rspec
```

## テスト実行

### フロントエンドテスト

```bash
# 通常のテスト実行
docker-compose exec frontend npm run test

# UIモードでテスト実行
docker-compose exec frontend npm run test:ui

# カバレッジ付きテスト
docker-compose exec frontend npm run test:coverage
```

### バックエンドテスト

```bash
# RSpecテスト実行
docker-compose exec backend rspec

# 特定のテストファイルのみ
docker-compose exec backend rspec spec/models/recipe_spec.rb
```

## 開発のベストプラクティス

### 1. パッケージ管理

- **フロントエンド**: 依存関係の追加・削除はコンテナ内で実行する
- **バックエンド**: Gem の追加・削除はコンテナ内で実行する
- パッケージ追加後は必要に応じてコンテナを再ビルドする

### 2. ファイル変更の反映

- **フロントエンド**: Viteのホットリロードが自動で動作
- **バックエンド**: Railsの開発モードで自動リロード
- ファイル変更が反映されない場合は以下を試す：
  ```bash
  docker-compose restart frontend
  docker-compose restart backend
  ```

### 3. データベース操作

```bash
# マイグレーション実行
docker-compose exec backend rails db:migrate

# シードデータ投入
docker-compose exec backend rails db:seed

# データベースリセット
docker-compose exec backend rails db:reset

# データベースコンソール
docker-compose exec db psql -U postgres tiramisu_app_development
```

### 4. 本番ビルドのテスト

```bash
# フロントエンドの本番ビルド
docker-compose exec frontend npm run build

# バックエンドの本番環境準備
docker-compose exec backend RAILS_ENV=production rails assets:precompile
```

## トラブルシューティング

### 1. ポートが使用中の場合

```bash
# ポートを使用しているプロセスを確認
lsof -i :5173  # フロントエンド
lsof -i :3000  # バックエンド
lsof -i :5432  # データベース

# プロセスを終了
kill -9 <PID>
```

### 2. node_modules の問題

```bash
# node_modules ボリュームを削除して再ビルド
docker-compose down -v
docker volume rm tiramisu-app_frontend_node_modules
docker-compose build frontend
docker-compose up frontend
```

### 3. データベース接続エラー

```bash
# データベースコンテナの再起動
docker-compose restart db

# データベースボリュームの削除（注意：データが消えます）
docker-compose down -v
docker volume rm tiramisu-app_db-data
docker-compose up db
```

### 4. キャッシュクリア

```bash
# Dockerビルドキャッシュをクリア
docker-compose build --no-cache

# 未使用のDockerリソースをクリア
docker system prune -f
```

## APIエンドポイント

### フロントエンド
- http://localhost:5173

### バックエンドAPI
- http://localhost:3000/api/v1

### データベース
- localhost:5432 (postgres/postgres)

## 主要なファイル・ディレクトリ

```
tiramisu-app/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reactコンポーネント
│   │   ├── pages/         # ページコンポーネント
│   │   ├── hooks/         # カスタムフック
│   │   ├── services/      # API呼び出し
│   │   ├── types/         # TypeScript型定義
│   │   └── contexts/      # React Context
│   ├── Dockerfile
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── controllers/   # API コントローラー
│   │   ├── models/       # データモデル
│   │   └── serializers/  # JSON シリアライザー
│   ├── config/
│   ├── db/
│   ├── Dockerfile
│   └── Gemfile
└── docker-compose.yml
```