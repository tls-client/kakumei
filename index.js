const DisboardScraper = require('./scraper');
const DiscordSender = require('./sender');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

class DisboardBot {
    constructor() {
        this.scraper = new DisboardScraper();
        this.sender = new DiscordSender();
        this.dataFile = path.join(__dirname, 'data', 'sent_links.json');
        this.isRunning = false;
    }

    async initialize() {
        console.log('Disboard Scraper Botを初期化中...');
        
        // データディレクトリを作成
        await this.ensureDataDirectory();
        
        // 送信済みリンクを読み込み
        await this.loadSentLinks();
        
        // Discord送信機能を初期化
        await this.sender.initialize();
        
        console.log('初期化完了');
    }

    async ensureDataDirectory() {
        const dataDir = path.dirname(this.dataFile);
        try {
            await fs.access(dataDir);
        } catch {
            await fs.mkdir(dataDir, { recursive: true });
        }
    }

    async loadSentLinks() {
        try {
            const data = await fs.readFile(this.dataFile, 'utf8');
            const sentData = JSON.parse(data);
            this.sender.sentLinks = new Set(sentData);
            console.log(`${sentData.length}個の送信済みリンクを読み込みました`);
        } catch (error) {
            console.log('送信済みリンクファイルがありません。新規作成します');
            await this.saveSentLinks();
        }
    }

    async saveSentLinks() {
        try {
            const sentData = Array.from(this.sender.sentLinks);
            await fs.writeFile(this.dataFile, JSON.stringify(sentData, null, 2));
        } catch (error) {
            console.error('送信済みリンクの保存エラー:', error.message);
        }
    }

    async runScraping(options = {}) {
        if (this.isRunning) {
            console.log('スクレイピングは既に実行中です');
            return;
        }

        this.isRunning = true;
        console.log('=== スクレイピング開始 ===');

        try {
            // Disboardからサーバーをスクレイピング
            const maxPages = options.maxPages || 3;
            const category = options.category || null;
            
            await this.scraper.scrapeMultiplePages(maxPages, category);
            
            // 新しい招待リンクを取得
            const newInvites = this.scraper.getNewInvites();
            
            if (newInvites.length === 0) {
                console.log('新しい招待リンクはありませんでした');
                return;
            }

            console.log(`${newInvites.length}個の新しい招待リンクを検出`);

            // 招待リンクの有効性を検証（オプション）
            const validInvites = [];
            for (const invite of newInvites) {
                const isValid = await this.scraper.validateInviteLink(invite.link);
                if (isValid) {
                    validInvites.push(invite);
                } else {
                    console.log(`無効な招待リンクをスキップ: ${invite.title}`);
                }
                
                // 検証のレート制限
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            if (validInvites.length === 0) {
                console.log('有効な招待リンクはありませんでした');
                return;
            }

            // Discordに送信
            const successCount = await this.sender.sendMultipleInvites(validInvites, 3);
            
            // 送信済みリンクを保存
            await this.saveSentLinks();
            
            console.log(`=== スクレイピング完了 ===`);
            console.log(`${successCount}/${validInvites.length}個の招待リンクを送信しました`);

        } catch (error) {
            console.error('スクレイピングエラー:', error);
        } finally {
            this.isRunning = false;
        }
    }

    startScheduler() {
        const interval = process.env.SCRAPE_INTERVAL_MINUTES || 30;
        const cronExpression = `*/${interval} * * * *`;
        
        console.log(`スケジューラーを開始します。間隔: ${interval}分`);
        
        cron.schedule(cronExpression, async () => {
            if (!this.isRunning) {
                await this.runScraping();
            }
        });

        // 初回実行
        setTimeout(() => this.runScraping(), 5000);
    }

    async shutdown() {
        console.log('シャットダウン中...');
        await this.saveSentLinks();
        await this.sender.close();
        console.log('シャットダウン完了');
    }
}

// メイン処理
async function main() {
    const bot = new DisboardBot();
    
    try {
        await bot.initialize();
        
        // コマンドライン引数でモードを切り替え
        const args = process.argv.slice(2);
        
        if (args.includes('--once')) {
            // 一回だけ実行
            await bot.runScraping({
                maxPages: parseInt(args.find(arg => arg.startsWith('--pages='))?.split('=')[1]) || 3,
                category: args.find(arg => arg.startsWith('--category='))?.split('=')[1] || null
            });
            await bot.shutdown();
        } else {
            // スケジューラーモード
            bot.startScheduler();
            
            // 終了シグナルを処理
            process.on('SIGINT', async () => {
                console.log('\\n終了シグナルを受信しました');
                await bot.shutdown();
                process.exit(0);
            });
            
            process.on('SIGTERM', async () => {
                console.log('\\n終了シグナルを受信しました');
                await bot.shutdown();
                process.exit(0);
            });
        }
        
    } catch (error) {
        console.error('起動エラー:', error);
        process.exit(1);
    }
}

// モジュールとしても利用可能
module.exports = DisboardBot;

if (require.main === module) {
    main();
}
