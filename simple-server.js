const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// 基本的なヘルスチェックエンドポイント
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        message: 'Discord Scraper is running'
    });
});

// UptimeRobot用エンドポイント
app.get('/uptime', (req, res) => {
    res.status(200).send('OK');
});

// ルートエンドポイント
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Discord Scraper API',
        endpoints: {
            health: '/health',
            uptime: '/uptime',
            status: '/status'
        }
    });
});

// ステータスエンドポイント
app.get('/status', (req, res) => {
    res.json({
        status: 'running',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
    });
});

// Expressサーバーを起動
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Simple server running on port ${PORT}`);
    console.log(`Health check available at: http://localhost:${PORT}/health`);
});

// グレースフルシャットダウン
process.on('SIGTERM', () => {
    console.log('SIGTERM received');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received');
    process.exit(0);
});
