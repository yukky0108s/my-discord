import { REST, Routes } from 'discord.js';
import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// config読み込み
const config = JSON.parse(readFileSync('./config.json', 'utf-8'));
const { clientId, guildId, token } = config;

// コマンド読み込み
const commands = [];
const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const fileUrl = pathToFileURL(path.join(__dirname, 'commands', file)).href;
  const command = await import(fileUrl);
  commands.push(command.data.toJSON());
}

// RESTインスタンス作成
const rest = new REST({ version: '10' }).setToken(token);

try {
  console.log('⏳ スラッシュコマンドを登録中...');
  await rest.put(
    Routes.applicationGuildCommands(clientId, guildId),
    { body: commands }
  );
  console.log('✅ コマンド登録完了！');
} catch (error) {
  console.error('❌ コマンド登録失敗:', error);
}