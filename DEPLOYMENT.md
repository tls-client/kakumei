# Koyeb + GitHub + UptimeRobot デプロイメントガイド

## 🚀 完全自動デプロイメント手順

### 1. GitHubリポジトリの準備

```bash
# スクリプトを実行してGitHubにプッシュ
chmod +x git_push.sh
./git_push.sh
```

### 2. GitHub Secretsの設定

GitHubリポジトリの `Settings > Secrets and variables > Actions` で以下のシークレットを追加：

```
KOYEB_API_TOKEN=your_koyeb_api_token
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_WEBHOOK_URL=your_discord_webhook_url
TARGET_CHANNEL_ID=your_target_channel_id
```

### 3. Koyeb APIトークンの取得

1. [Koyeb Dashboard](https://app.koyeb.com)にログイン
2. `Account > API Keys` で新しいAPIキーを作成
3. GitHub Secretsに `KOYEB_API_TOKEN` として保存

### 4. 自動デプロイメント

GitHubにプッシュすると、自動的に以下が実行されます：

1. **GitHub Actions**が起動
2. **Dockerイメージ**がビルド
3. **Koyeb**に自動デプロイ
4. **ヘルスチェック**が有効化

### 5. UptimeRobot監視設定

1. [UptimeRobot](https://uptimerobot.com)にログイン
2. 新しいモニターを追加：
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://your-app-name.koyeb.app/uptime`
   - **Monitoring Interval**: 5分
   - **Alert Contacts**: 通知先を設定

### 6. 環境変数の確認

Koyebダッシュボードで以下の環境変数が設定されていることを確認：

```
NODE_ENV=production
PORT=3000
DISCORD_BOT_TOKEN=***
DISCORD_WEBHOOK_URL=***
TARGET_CHANNEL_ID=***
SCRAPE_INTERVAL_MINUTES=30
```

## 🔧 監視エンドポイント

| エンドポイント | 用途 |
|-------------|------|
| `/health` | Koyebヘルスチェック |
| `/uptime` | UptimeRobot監視 |
| `/status` | アプリケーション状態確認 |

## 📊 自動化機能

- ✅ **自動スクレイピング**: 30分間隔でDisboardを監視
- ✅ **自動デプロイ**: GitHubプッシュでKoyebに自動デプロイ
- ✅ **常時監視**: UptimeRobotで24/7監視
- ✅ **エラー通知**: 異常発生時にアラート
- ✅ **ヘルスチェック**: アプリケーション状態を常時監視

## 🛠️ トラブルシューティング

### デプロイメント失敗
```bash
# GitHub Actionsログを確認
# Koyebダッシュボードでデプロイメントログを確認
```

### UptimeRobotアラート
- `/health` エンドポイントが応答しているか確認
- Koyebダッシュボードでアプリケーション状態を確認

### Discord送信エラー
- Botトークン/Webhook URLが正しいか確認
- チャンネルIDが正しいか確認
- Discord APIのレート制限を確認

## 🔄 更新手順

1. コードを修正
2. `git add . && git commit -m "Update" && git push`
3. 自動でデプロイ完了

これで完全に自動化されたDiscordスクレイパーが完成です！
