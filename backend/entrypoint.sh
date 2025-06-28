#!/usr/bin/env bash
set -e

# 前回起動の PID が残っていると再起動できない対策
rm -f /app/tmp/pids/server.pid

# データベースが起動するまで待機
echo "🔄 データベース接続を待機中..."
until nc -z db 5432; do
  echo "⏳ データベースが起動するまで待機中..."
  sleep 2
done
echo "✅ データベースに接続しました"

# データベースの準備（存在しなければ作成・マイグレート）
echo "🔧 データベースを準備中..."
export DATABASE_URL="postgresql://postgres:postgres@db:5432/myapp_development"
bundle exec rails db:prepare
echo "✅ データベース準備完了"

exec "$@"
