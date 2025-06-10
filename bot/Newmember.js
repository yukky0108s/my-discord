/**
 * 新規メンバーがサーバーに参加したときの処理を定義します。
 * @param {import('discord.js').GuildMember} member - サーバーに参加したメンバーオブジェクト。
 */
async function handleNewMember(member) {
    console.log(`${member.user.tag} が ${member.guild.name} に参加しました。`);

    // 付与したいロールの名前またはID
    // 確実性を高めるため、ロールIDを使用することを強く推奨します。
    // 例: const roleId = 'YOUR_ROLE_ID_HERE';
    const roleName = '仮メンバー'; // 例: 新規参加者ロール

    // ロールを検索（名前で検索する場合）
    const role = member.guild.roles.cache.find(r => r.name === roleName);

    // ロールIDで検索する場合の例:
    // const role = member.guild.roles.cache.get(roleId);

    if (role) {
        try {
            await member.roles.add(role);
            console.log(`${member.user.tag} にロール '${role.name}' を付与しました。`);
        } catch (error) {
            console.error(`${member.user.tag} へのロール付与に失敗しました:`, error);
            // 権限不足などのエラーをDiscord上で通知することも検討してください。
            // 例: member.guild.channels.cache.find(c => c.name === 'bot-log').send(`ロール付与エラー: ${error.message}`);
        }
    } else {
        console.warn(`ロール '${roleName}' が見つかりませんでした。サーバー設定を確認してください。`);
    }

    // 特定のチャンネルにウェルカムメッセージを送信する場合（オプション）
    const welcomeChannelId = process.env.WelcomeChannelId; // ウェルカムメッセージを送信したいチャンネルのID
    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);

    if (welcomeChannel && welcomeChannel.isTextBased()) {
        try {
            await welcomeChannel.send(`${member.user}, ようこそ **${member.guild.name}** へ！`);
        } catch (error) {
            console.error(`ウェルカムメッセージの送信に失敗しました:`, error);
        }
    }
}

export { handleNewMember};