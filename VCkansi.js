const { Client, GatewayIntentBits, Events } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const DISCORD_TOKEN = 'YOUR_DISCORD_BOT_TOKEN';
const TARGET_VC_ID = 'VOICE_CHANNEL_ID'; // 監視したいVCのID
const GUILD_ID = 'YOUR_GUILD_ID';        // サーバーのID

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ],
});

client.once('ready', () => {
  console.log(`✅ Bot起動成功: ${client.user.tag}`);
});

// ずんだもん音声合成API
async function generateZundamonSpeech(text) {
  try {
    const response = await axios.post('https://api.su-shiki.com/v1/text-to-speech', {
      voice: 'zundamon', // ずんだもんの音声
      text: text,
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'  // ずんだもんAPIのAPIキー
      },
      responseType: 'arraybuffer' // 音声データをそのまま受け取る
    });

    const filePath = path.join(__dirname, 'output.mp3');
    fs.writeFileSync(filePath, response.data); // 音声をファイルとして保存
    return filePath;
  } catch (error) {
    console.error('音声合成エラー:', error);
  }
}

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  // 新しくVCに参加した場合（自分ではない、対象VCに入った）
  if (!oldState.channelId && newState.channelId === TARGET_VC_ID && newState.member.user.bot === false) {
    console.log(`${newState.member.user.username} がVCに参加しました`);

    // ずんだもんの音声を生成
    const speechText = `${newState.member.user.username}さんが入室しました。`;
    const audioFilePath = await generateZundamonSpeech(speechText);

    // VCに接続
    const connection = joinVoiceChannel({
      channelId: TARGET_VC_ID,
      guildId: GUILD_ID,
      adapterCreator: newState.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    const resource = createAudioResource(audioFilePath); // 合成音声を再生

    connection.subscribe(player);
    player.play(resource);

    // 音声が再生された後に切断
    player.on('idle', () => {
      connection.destroy();
      fs.unlinkSync(audioFilePath); // 音声ファイルを削除
    });
  }
});

client.login(DISCORD_TOKEN);
