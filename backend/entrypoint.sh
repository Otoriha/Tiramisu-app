#!/usr/bin/env bash
set -e

# 前回起動の PID が残っていると再起動できない対策
rm -f /app/tmp/pids/server.pid

# 追加（存在しなければ作成・マイグレート）
bundle exec rails db:prepare

exec "$@"
