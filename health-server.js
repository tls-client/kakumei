const express = require('express');
const DisboardBot = require('./index');

const app = express();
const PORT = process.env.PORT || 3000;

let bot = null;
let isHealthy = false;

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        botRunning: bot && !bot.isRunning
    });
});

// UptimeRobot用エンドポイント
app.get('/uptime', (req, res) => {
    res.status(200).send('OK');
});

// ステータスエンドポイント
app.get('/status', (req, res) => {
    res.json({
        status: isHealthy ? 'running' : 'initializing',
        lastScrape: bot ? 'N/A' : 'Not started',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: require('./package.json').version
    });
});

// メインアプリケーションを起動
async function startApp() {
    try {
        console.log('Disboard Scraperを起動中...');
        
        bot = new DisboardBot();
        await bot.initialize();
        
        // スケジューラーを開始
        bot.startScheduler();
        
        isHealthy = true;
        console.log('アプリケーションが正常に起動しました');
        
    } catch (error) {
        console.error('アプリケーション起動エラー:', error);
        isHealthy = false;
    }
}

// Expressサーバーを起動
app.listen(PORT, '0.0.0.0', () => {
    console.log(`ヘルスチェックサーバーがポート ${PORT} で起動しました`);
    
    // メインアプリケーションを起動
    startApp();
});

// グレースフルシャットダウン
process.on('SIGTERM', async () => {
    console.log('SIGTERMを受信しました');
    if (bot) {
        await bot.shutdown();
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINTを受信しました');
    if (bot) {
        await bot.shutdown();
    }
    process.exit(0);
});
