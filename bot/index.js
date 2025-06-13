import dotenv from 'dotenv';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import {Marinchat} from './Marinchanchat.js'
import {handleNewMember} from './Newmember.js'
import {voiceNotify} from './VoiceNotify.js'

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

// ボットをDiscordにログインさせる
client.login(process.env.TOKEN);