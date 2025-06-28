import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESModulesで__dirname取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const remindersPath = path.join(__dirname, '../reminders.json');

export const data = new SlashCommandBuilder()
  .setName('remove-remind')
  .setDescription('設定した定期リマインドを削除します');

export async function execute(interaction) {
  const reminders = JSON.parse(fs.readFileSync(remindersPath, 'utf8'));
  const userReminders = reminders
    .map((reminder, index) => ({ ...reminder, index }))
    .filter(r => r.channelId === interaction.channel.id);

  if (userReminders.length === 0) {
    return interaction.reply({ content: '🔕 このチャンネルには削除できるリマインドがありません。', ephemeral: true });
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('remove_reminder_select')
    .setPlaceholder('削除するリマインドを選択...')
    .addOptions(userReminders.map(r => ({
      label: r.message.slice(0, 25),
      description: `毎${r.frequency === 'daily' ? '日' : '週'} ${String(r.hour).padStart(2, '0')}:${String(r.minute).padStart(2, '0')}`,
      value: String(r.index),
    })));

  const row = new ActionRowBuilder().addComponents(selectMenu);

  await interaction.reply({
    content: '🗑️ 削除したいリマインドを選んでください',
    components: [row],
    ephemeral: true
  });
}