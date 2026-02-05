FROM node:18-slim

# Puppeteerの依存関係をインストール
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    chromium \
    && rm -rf /var/lib/apt/lists/*

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

# PuppeteerにChromiumを使用するよう設定
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 環境変数を設定
ENV NODE_ENV=production

# ポートを公開（ヘルスチェック用）
EXPOSE 3000

# アプリケーションを起動
CMD ["node", "simple-server.js"]
