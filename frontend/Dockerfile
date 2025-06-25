FROM --platform=linux/amd64 node:20.19.0-alpine

WORKDIR /usr/src/app

# 依存レイヤーをキャッシュするために lock もまとめてコピー
COPY package.json package-lock.json ./
RUN npm install

# 残りのソース
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev"]
