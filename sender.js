const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

class DiscordSender {
    constructor() {
        this.client = null;
        this.webhookUrl = process.env.DISCORD_WEBHOOK_URL;
        this.targetChannelId = process.env.TARGET_CHANNEL_ID;
        this.botToken = process.env.DISCORD_BOT_TOKEN;
    }

    async initialize() {
        if (this.webhookUrl) {
            console.log('Webhookモードで初期化');
            return true;
        }
        
        if (this.botToken && this.targetChannelId) {
            console.log('Botモードで初期化');
            this.client = new Client({
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.MessageContent
                ]
            });

            this.client.once('ready', () => {
                console.log(`Botがログインしました: ${this.client.user.tag}`);
            });

            await this.client.login(this.botToken);
            return true;
        }

        throw new Error('DISCORD_WEBHOOK_URL または (DISCORD_BOT_TOKEN と TARGET_CHANNEL_ID) が必要です');
    }

    async sendInviteWebhook(inviteData) {
        if (!this.webhookUrl) {
            throw new Error('Webhook URLが設定されていません');
        }

        const embed = new EmbedBuilder()
            .setTitle(`🎮 新しいDiscordサーバー: ${inviteData.title}`)
            .setDescription(inviteData.description || '説明なし')
            .addFields(
                { name: '🔗 招待リンク', value: `[ここをクリック](${inviteData.link})`, inline: true },
                { name: '📂 カテゴリ', value: inviteData.category || '未分類', inline: true },
                { name: '⏰ 取得時刻', value: new Date(inviteData.scrapedAt).toLocaleString('ja-JP'), inline: false }
            )
            .setColor('#0099ff')
            .setTimestamp()
            .setFooter({ text: 'Disboard Scraper', iconURL: 'https://disboard.org/images/logo.png' });

        try {
            const response = await axios.post(this.webhookUrl, {
                embeds: [embed],
                username: 'Disboard Scraper',
                avatar_url: 'https://disboard.org/images/logo.png'
            });

            console.log(`Webhookで送信完了: ${inviteData.title}`);
            return response.status === 204;
        } catch (error) {
            console.error('Webhook送信エラー:', error.response?.data || error.message);
            return false;
        }
    }

    async sendInviteBot(inviteData) {
        if (!this.client || !this.targetChannelId) {
            throw new Error('BotまたはチャンネルIDが設定されていません');
        }

        const channel = await this.client.channels.fetch(this.targetChannelId);
        if (!channel) {
            throw new Error('チャンネルが見つかりません');
        }

        const embed = new EmbedBuilder()
            .setTitle(`🎮 新しいDiscordサーバー: ${inviteData.title}`)
            .setDescription(inviteData.description || '説明なし')
            .addFields(
                { name: '🔗 招待リンク', value: `[ここをクリック](${inviteData.link})`, inline: true },
                { name: '📂 カテゴリ', value: inviteData.category || '未分類', inline: true },
                { name: '⏰ 取得時刻', value: new Date(inviteData.scrapedAt).toLocaleString('ja-JP'), inline: false }
            )
            .setColor('#00ff00')
            .setTimestamp()
            .setFooter({ text: 'Disboard Scraper' });

        try {
            await channel.send({ embeds: [embed] });
            console.log(`Botで送信完了: ${inviteData.title}`);
            return true;
        } catch (error) {
            console.error('Bot送信エラー:', error.message);
            return false;
        }
    }

    async sendInvite(inviteData) {
        try {
            if (this.webhookUrl) {
                return await this.sendInviteWebhook(inviteData);
            } else {
                return await this.sendInviteBot(inviteData);
            }
        } catch (error) {
            console.error('送信失敗:', error.message);
            return false;
        }
    }

    async sendMultipleInvites(inviteList, maxPerBatch = 5) {
        console.log(`${inviteList.length}個の招待リンクを送信中...`);
        
        const batches = [];
        for (let i = 0; i < inviteList.length; i += maxPerBatch) {
            batches.push(inviteList.slice(i, i + maxPerBatch));
        }

        let successCount = 0;
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            console.log(`バッチ ${i + 1}/${batches.length} を処理中...`);
            
            for (const invite of batch) {
                const success = await this.sendInvite(invite);
                if (success) successCount++;
                
                // レート制限を避けるため待機
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // バッチ間の待機
            if (i < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        console.log(`${successCount}/${inviteList.length}個の招待リンクを送信完了`);
        return successCount;
    }

    async close() {
        if (this.client) {
            this.client.destroy();
            console.log('Botを終了しました');
        }
    }
}

module.exports = DiscordSender;
