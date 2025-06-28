import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('remind')
  .setDescription('指定した時間後にリマインドします')
  .addStringOption(option =>
    option.setName('message')
      .setDescription('リマインドする内容')
      .setRequired(true))
  .addIntegerOption(option =>
    option.setName('seconds')
      .setDescription('何秒後にリマインドするか')
      .setRequired(true));

export async function execute(interaction) {
  const message = interaction.options.getString('message');
  const seconds = interaction.options.getInteger('seconds');

  if (seconds <= 0) {
    return interaction.reply({ content: '⚠️ 1秒以上を指定してください。', ephemeral: true });
  }

  await interaction.reply(`⏳ ${seconds}秒後にリマインドします：\n> ${message}`);

  setTimeout(() => {
    interaction.followUp({
      content: `🔔 リマインド！\n> ${message}`,
      ephemeral: false
    });
  }, seconds * 1000);
}
