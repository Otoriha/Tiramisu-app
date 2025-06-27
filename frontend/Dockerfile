FROM --platform=linux/amd64 node:20.19.0-alpine

WORKDIR /usr/src/app

# package files をコピーして依存関係をインストール（キャッシュ効率化）
COPY package.json package-lock.json ./

# 開発用と本番用両方の依存関係をインストール
RUN npm ci

# ユーザーを作成してセキュリティ向上
RUN addgroup -g 1001 -S nodejs && \
    adduser -S tiramisu -u 1001

# アプリディレクトリの所有権を変更
RUN chown -R tiramisu:nodejs /usr/src/app
USER tiramisu

# 残りのソースをコピー
COPY --chown=tiramisu:nodejs . .

EXPOSE 5173

# Vite dev server用の設定
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
