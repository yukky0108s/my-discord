import dotenv from 'dotenv';
import { Client, GatewayIntentBits, Partials,Collection } from 'discord.js';
import {Marinchat} from './Marinchanchat.js'
import {handleNewMember} from './Newmember.js'
import {voiceNotify} from './VoiceNotify.js'
import fs from 'fs';
import { readdirSync } from 'fs';

import path from 'path';
import { fileURLToPath,pathToFileURL } from 'url';

dotenv.config();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,           // サーバー関連のイベント (ロール付与、チャンネル取得など)
        GatewayIntentBits.GuildMessages,    // メッセージイベント (メンション反応)
        GatewayIntentBits.MessageContent,   // メッセージ内容の読み取り (メンション反応)
        GatewayIntentBits.GuildMembers,     // メンバー関連イベント (新規参加者ロール付与)
        GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [Partials.GuildMember] // GuildMemberイベントの処理に必要
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const remindersPath = path.join(__dirname, 'reminders.json');
// --- イベントリスナーの登録 ---

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log('Bot is online!');
});

// 新規メンバーがサーバーに参加したときの処理
client.on('guildMemberAdd', handleNewMember);

// メッセージが作成されたときの処理
client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // ボット自身のメッセージは無視

    // Botへのメンションがあるかどうかを確認し、あればhandleMentionを呼び出す
    if (message.mentions.users.has(client.user.id) &&
        message.mentions.users.size === 1 &&
        !message.mentions.everyone) {
        await Marinchat(message, client,process.env.GOOGLE_GENAI_API_KEY); // clientオブジェクトも渡す
    }
    // 他のメッセージタイプやコマンドがあればここに追加
});
client.on('voiceStateUpdate', (oldState, newState) => {
  voiceNotify(oldState, newState);
});

client.on('interactionCreate', async interaction => {
  if (interaction.isStringSelectMenu() && interaction.customId === 'remove_reminder_select') {
    const selectedIndex = parseInt(interaction.values[0]);
    const reminders = JSON.parse(fs.readFileSync(remindersPath, 'utf8'));

    const removed = reminders.splice(selectedIndex, 1);
    fs.writeFileSync(remindersPath, JSON.stringify(reminders, null, 2));

    await interaction.update({
      content: `🗑️ リマインドを削除しました：\n> ${removed[0].message}`,
      components: []
    });

    // 必要に応じて cron ジョブの再ロード処理を追加
  }
});

const commandFiles = readdirSync('./bot/commands').filter(file => file.endsWith('.js'));
client.commands = new Collection();
for (const file of commandFiles) {
  const fileUrl = pathToFileURL(`./bot/commands/${file}`);
  const command = await import(fileUrl.href);
  client.commands.set(command.data.name, command);
}
// ボットをDiscordにログインさせる
client.login(process.env.TOKEN);