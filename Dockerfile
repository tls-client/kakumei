FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# 依存関係をコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci --only=production

# アプリケーションコードをコピー
COPY . .

# データディレクトリを作成
RUN mkdir -p data

# 環境変数を設定
ENV NODE_ENV=production

# ポートを公開（ヘルスチェック用）
EXPOSE 3000

# ヘルスチェック用の簡単なサーバーを追加
COPY health-server.js ./

# アプリケーションを起動
CMD ["node", "health-server.js"]
