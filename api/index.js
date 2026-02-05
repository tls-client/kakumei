const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// 基本的なヘルスチェックエンドポイント
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        message: 'Discord Scraper is running on Vercel'
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
        status: 'running',
        platform: 'Vercel',
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
        platform: 'Vercel',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Vercel serverless function export
module.exports = (req, res) => {
    app(req, res);
};
