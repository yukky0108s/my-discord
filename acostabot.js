const { Client, GatewayIntentBits } = require('discord.js');
const Parser = require('rss-parser');
const cron = require('node-cron');

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
