# Disboard Scraper

Disboard.orgからDiscordサーバーの招待リンクを自動でスクレイピングし、指定したDiscordサーバーに送信するツールです。

## 機能

- 🕷️ Disboard.orgから自動でサーバー情報をスクレイピング
- 📝 招待リンクの有効性を検証
- 🚀 Discord BotまたはWebhookで自動送信
- ⏰ スケジューラー機能で定期的に実行
- 💾 送信済みリンクの管理（重複送信防止）
- 🎯 カテゴリ別のスクレイピング対応

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` を作成：

```bash
cp .env.example .env
```

`.env` ファイルを編集：

```env
# Discord Bot Token (Botモードの場合)
DISCORD_BOT_TOKEN=your_bot_token_here

# Discord Webhook URL (Webhookモードの場合)
DISCORD_WEBHOOK_URL=your_webhook_url_here

# Target Channel ID (Botモードの場合)
TARGET_CHANNEL_ID=your_target_channel_id_here

# スクレイピング設定
SCRAPE_INTERVAL_MINUTES=30
MAX_INVITES_PER_BATCH=10

# 対象URL (現在はDisboard固定)
TARGET_URLS=https://disboard.org/ja
```

### 3. Discordの設定

#### Botモードの場合：
1. [Discord Developer Portal](https://discord.com/developers/applications)でアプリを作成
2. Botを作成してトークンを取得
3. Botに以下の権限を付与：
   - メッセージを送信
   - メッセージを読む
4. サーバーにBotを招待
5. チャンネルIDを取得

#### Webhookモードの場合：
1. 対象チャンネルでWebhookを作成
2. Webhook URLを取得

## 使い方

### 一回だけ実行

```bash
node index.js --once --pages=5
```

オプション：
- `--once`: 一回だけ実行
- `--pages=N`: スクレイピングするページ数（デフォルト: 3）
- `--category=カテゴリID`: 特定カテゴリのみを対象

### スケジューラーモードで実行

```bash
npm start
```

または

```bash
node index.js
```

設定した間隔で自動的にスクレイピングと送信を実行します。

## カテゴリ一例

Disboardの主なカテゴリ：
- `gaming`: ゲーム
- `anime-manga`: アニメ・漫画
- `music`: 音楽
- `technology`: テクノロジー
- `art`: アート
- `roleplay`: ロールプレイ

## 例

### ゲームカテゴリのみを5ページ分スクレイピング

```bash
node index.js --once --pages=5 --category=gaming
```

### 15分間隔で自動実行

`.env` に設定：
```env
SCRAPE_INTERVAL_MINUTES=15
```

## 注意事項

- Discordの利用規約を遵守してください
- 過度なスクレイピングはIPブロックの原因になります
- レート制限に配慮した間隔を設定してください
- 招待リンクの有効性は変動する可能性があります

## トラブルシューティング

### Puppeteer関連のエラー
```bash
# Ubuntu/Debianの場合
sudo apt-get install -y libnss3-dev libatk-bridge2.0-dev libdrm2 libxkbcommon-dev libxcomposite-dev libxdamage-dev libxrandr-dev libgbm-dev libxss-dev

# CentOS/RHELの場合
sudo yum install -y nss atk at-spi2-atk libXcomposite libXcursor libXdamage libXrandr libgbm libXss
```

### 権限エラー
Botがチャンネルにメッセージを送信する権限を持っているか確認してください。

## ライセンス

MIT License
