const NOTIFY_CHANNEL_IDS = process.env.VoiceCHANNEL_ID?.split(',') || [];

async function voiceNotify(oldState, newState) {
  // 入室判定：前のVCがnull、今のVCが存在する
  if (!oldState.channel && newState.channel) {
    const user = newState.member.user;
    const vcName = newState.channel.name;
    const guild = newState.guild;
    const joinedChannelId = newState.channel.id;

    // 通知対象VCに一致するかを判定
    if (NOTIFY_CHANNEL_IDS.includes(joinedChannelId)) {
      const notifyChannel = guild.channels.cache.get(process.env.NOTIFY_TEXT_CHANNEL_ID); // 通知用テキストチャンネルのIDも別途指定

      if (notifyChannel && notifyChannel.isTextBased()) {
        notifyChannel.send(`🔔 ${user.tag} が VC「${vcName}」に参加しました！`);
      } else {
        console.log('Cannot send message! テキストチャンネルが見つかりません。');
      }
    }
  }
};

export { voiceNotify };