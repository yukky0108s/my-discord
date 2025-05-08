const { Client, GatewayIntentBits } = require('discord.js');
const Parser = require('rss-parser');
const cron = require('node-cron');

const DISCORD_TOKEN = 'MTIyOTc5MzUzMjkyODA2OTczMw.G3lR0w.qSTY6OkmSh1seELZqgHwiQbckGJHMiGIswkVls';       // ← ここに自分のトークン
const CHANNEL_ID = 'https://discord.com/channels/1039455922386382850/1226478966177792080';                 // ← DiscordチャンネルのID
const FEED_URL = 'https://nitter.net/acosta_west/rss';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const parser = new Parser();
let lastItemLink = null;

client.once('ready', () => {
  console.log(`✅ Bot起動成功: ${client.user.tag}`);

  // 毎分RSSをチェック
  cron.schedule('* * * * *', async () => {
    try {
      const feed = await parser.parseURL(FEED_URL);
      if (!feed.items || feed.items.length === 0) return;

      const latest = feed.items[0];
      if (latest.link !== lastItemLink) {
        const channel = await client.channels.fetch(CHANNEL_ID);
        await channel.send(`📢 @acosta_westの新しい投稿:\n${latest.link}`);
        lastItemLink = latest.link;
      }
    } catch (err) {
      console.error('❌ フィード取得エラー:', err.message);
    }
  });
});

client.login(DISCORD_TOKEN);
