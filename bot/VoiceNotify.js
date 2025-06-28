const NOTIFY_CHANNEL_ID = process.env.VoiceCHANNEL_ID?.split(',') || [];

async function voiceNotify(oldState, newState) {
  // 入室判定：前のVCがnull、今のVCが存在する
  if (!oldState.channel && newState.channel) {
    const user = newState.member.user;
    const vcName = newState.channel.name;
    const guild = newState.guild;
    const notifyChannel = guild.channels.cache.get(NOTIFY_CHANNEL_ID);

    if (notifyChannel) {
      notifyChannel.send(`🔔 ${user.tag} が VC「${vcName}」に参加しました！`);
    }
    else{
        console.log('Cannot send message!');
    }
  }
};
export {voiceNotify}