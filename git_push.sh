#!/bin/bash

# Gitリポジトリの初期化とプッシュスクリプト

echo "=== Discord Scraper - GitHubリポジトリへのプッシュ ==="

# リポジトリ情報
REPO_URL="https://github.com/tls-client/kakumei.git"
BRANCH="main"

# Gitの初期化（必要な場合）
if [ ! -d ".git" ]; then
    echo "Gitリポジトリを初期化します..."
    git init
    git remote add origin $REPO_URL
fi

# ブランチの設定
git branch -M $BRANCH

# ファイルをステージング
echo "ファイルをステージング中..."
git add .

# コミット
echo "変更をコミット中..."
git commit -m "Add Discord scraper with Koyeb deployment and UptimeRobot monitoring

Features:
- Disboard.org scraping for Discord invite links
- Automatic invite link validation and sending
- Docker containerization for Koyeb deployment
- Health check endpoints for UptimeRobot
- GitHub Actions CI/CD pipeline
- Express server for monitoring

Files:
- scraper.js: Disboard scraping functionality
- sender.js: Discord bot/webhook sender
- index.js: Main application logic
- health-server.js: Express server with health checks
- Dockerfile: Container configuration
- koyeb.yaml: Koyeb deployment config
- .github/workflows/deploy.yml: CI/CD pipeline"

# プッシュ
echo "GitHubにプッシュ中..."
git push -u origin $BRANCH

echo "=== プッシュ完了 ==="
echo "次のステップ："
echo "1. GitHubリポジトリでActionsタブを確認"
echo "2. Koyebでデプロイメントを確認"
echo "3. UptimeRobotで監視を設定: https://your-koyeb-app.koyeb.app/uptime"
