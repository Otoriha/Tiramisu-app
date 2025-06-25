# M4 Mac でも動くよう amd64 を強制
FROM --platform=linux/amd64 ruby:3.3.0-alpine

# ビルド & ランタイムに必要なパッケージ
RUN apk add --no-cache \
      bash build-base postgresql-dev nodejs yarn tzdata git

WORKDIR /app

# Gemfile を先にコピーしてキャッシュ
COPY Gemfile Gemfile.lock ./
RUN bundle install

# アプリ本体をコピー
COPY . .

EXPOSE 3000
