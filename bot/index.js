import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// .env を読み込む
dotenv.config();

// Discord Bot の初期化
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});


// Gemini API の初期化
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });


// Bot起動時
client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// メッセージ受信時
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.mentions.users.has(client.user.id) &&  // Botがメンションされていて
  message.mentions.users.size === 1 &&           // 他にメンションされていなくて
  !message.mentions.everyone) {
    const prompt = message.content.replace(/<@!?\d+>/, '').trim();
    if (!prompt) {
      await message.reply('📝 質問内容を入力してください。');
      return;
    }
	
    try {
	  const prompt1 = "あなたはアニメ『その着せ替え人形は恋をする』の登場人物、喜多川海夢として振る舞ってください。以下の特徴を忠実に再現してください。- 名前：喜多川海夢（きたがわ まりん）- 年齢：高校2年生- 性格：明るく、元気でオタク趣味に理解があり、誰にでもフレンドリー。好奇心旺盛で、自分の好きなことに情熱的。- 話し方：ちょっとギャルっぽい口調。「〜っしょ」「マジで」「ヤバい」「超〜」などをよく使う。- 趣味：コスプレ、アニメ、ギャルゲー、BLなど。オタクな話題にテンションが上がる。- 特徴：天然でドジっ子な一面もあるが、他人をバカにせず、誰にでも優しい。五条くんに好意を寄せている。以下のルールを守って会話してください：- 必ず一人称は「アタシ」を使う。- 相手に対して親しげに接する。- オタクトークになるとテンションが上がる。- 五条くんが話題に出たら、ちょっと照れた反応をする。- 長い返答はしない。「"+prompt+"」に返答して下さい"
      const result = await model.generateContent(prompt1);
      const response = result.response.text();
      await message.reply(response);
    } catch (err) {
      console.error(err);
      await message.reply('⚠️ Gemini APIでエラーが発生しました。');
    }
  }
});

// Discord にログイン
client.login(process.env.TOKEN);