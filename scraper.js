const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
require('dotenv').config();

class DisboardScraper {
    constructor() {
        this.baseUrl = 'https://disboard.org/ja';
        this.inviteLinks = new Set();
        this.sentLinks = new Set();
    }

    async scrapeDisboardServers(page = 1, category = null) {
        console.log(`Disboardからサーバーをスクレイピング中... ページ: ${page}`);
        
        const browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        try {
            const pageInstance = await browser.newPage();
            
            // User-Agentを設定
            await pageInstance.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            
            let url = `${this.baseUrl}?page=${page}`;
            if (category) {
                url += `&category=${category}`;
            }
            
            await pageInstance.goto(url, { waitUntil: 'networkidle2' });
            
            // ページが完全に読み込まれるまで待機
            await pageInstance.waitForTimeout(3000);
            
            // サーバーカードを取得
            const servers = await pageInstance.evaluate(() => {
                const serverCards = document.querySelectorAll('.server-card');
                return Array.from(serverCards).map(card => {
                    const titleElement = card.querySelector('.server-title');
                    const linkElement = card.querySelector('a[href*="discord.gg"]');
                    const descElement = card.querySelector('.server-description');
                    const categoryElement = card.querySelector('.server-category');
                    
                    return {
                        title: titleElement ? titleElement.textContent.trim() : '',
                        inviteLink: linkElement ? linkElement.href : '',
                        description: descElement ? descElement.textContent.trim() : '',
                        category: categoryElement ? categoryElement.textContent.trim() : ''
                    };
                });
            });
            
            console.log(`${servers.length}個のサーバーを検出しました`);
            
            // 招待リンクを抽出
            servers.forEach(server => {
                if (server.inviteLink && server.inviteLink.includes('discord.gg')) {
                    this.inviteLinks.add({
                        title: server.title,
                        link: server.inviteLink,
                        description: server.description,
                        category: server.category,
                        scrapedAt: new Date().toISOString()
                    });
                }
            });
            
            await browser.close();
            return servers;
            
        } catch (error) {
            console.error('スクレイピングエラー:', error);
            await browser.close();
            return [];
        }
    }

    async scrapeMultiplePages(maxPages = 5, category = null) {
        console.log(`複数ページからスクレイピング開始... 最大${maxPages}ページ`);
        
        for (let page = 1; page <= maxPages; page++) {
            await this.scrapeDisboardServers(page, category);
            // レート制限を避けるため待機
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        console.log(`合計${this.inviteLinks.size}個の招待リンクを取得`);
        return Array.from(this.inviteLinks);
    }

    getNewInvites() {
        const allInvites = Array.from(this.inviteLinks);
        const newInvites = allInvites.filter(invite => 
            !this.sentLinks.has(invite.link)
        );
        
        // 新しいリンクを送信済みセットに追加
        newInvites.forEach(invite => this.sentLinks.add(invite.link));
        
        return newInvites;
    }

    async validateInviteLink(inviteLink) {
        try {
            // 招待リンクの有効性をチェック
            const response = await axios.head(inviteLink, { 
                timeout: 10000,
                validateStatus: () => true 
            });
            
            return response.status < 400;
        } catch (error) {
            console.log(`招待リンク検証失敗: ${inviteLink}`, error.message);
            return false;
        }
    }
}

module.exports = DisboardScraper;
