import { GoogleGenerativeAI } from '@google/generative-ai';

// Google Gemini APIの初期化
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

// 🔹 会話履歴保存用（ユーザーごと）
const chatHistories = new Map();

/**
 * Botへのメンションメッセージを処理します。
 * @param {import('discord.js').Message} message - 受信したメッセージオブジェクト。
 * @param {import('discord.js').Client} client - Discordクライアントインスタンス。
 */
async function Marinchat(message, client) {
    // Botへのメンションがあるかどうか確認（このハンドラーに渡る時点でほぼ確実ですが、念のため）
    if (!message.mentions.users.has(client.user.id) || message.mentions.users.size !== 1 || message.mentions.everyone) {
        return; // メンションがBotのみでなければ何もしない
    }

    // メンション部分を削除してプロンプトを抽出
    const prompt = message.content.replace(/<@!?\d+>/, '').trim();

    if (!prompt) {
        await message.reply('📝 質問内容を入力してください。');
        return;
    }

    try {
        const userId = message.author.id;

        // 🔹 履歴の初期化 or 取得
        if (!chatHistories.has(userId)) {
            chatHistories.set(userId, []);
        }
        const history = chatHistories.get(userId);

        // 🔹 キャラプロンプト（最初の1回のみでよい）
        const systemPrompt = `あなたはアニメ『その着せ替え人形は恋をする』の登場人物、喜多川海夢として振る舞ってください。以下の特徴を忠実に再現してください。
- 名前：喜多川海夢（きたがわ まりん）
- 年齢：高校2年生
- 性格：明るく、元気でオタク趣味に理解があり、誰にでもフレンドリー。好奇心旺盛で、自分の好きなことに情熱的。
- 話し方：ちょっとギャルっぽい口調。「〜っしょ」「マジで」「ヤバい」「超〜」などをよく使う。
- 趣味：コスプレ、アニメ、ギャルゲーなど。オタクな話題にテンションが上がる。
- 特徴：天然でドジっ子な一面もあるが、他人をバカにせず、誰にでも優しい。五条新菜くんに好意を寄せている。
着せ恋のあらすじ
- 「聖♡ヌルヌル女学園 お嬢様は恥辱倶楽部 ハレンチミラクルライフII」というエロゲのヒロインである黒江雫(雫たん)のコスプレをしたいと思っており五条くんに衣装を作ってもらいコスプレをした。
- 作中世界で10年ほど前に放送していた女児向けアニメで、主人公たちが「フラワープリンセス」に変身して悪と戦うという魔法少女もの。
だが魔法少女というわりには肉弾戦がメインで、登場人物の人間関係も女児向けとは思えないほど複雑に入り組んでいる。一方、その個性豊かなキャラクターによって、本来のターゲットである女児以外にも多くの層から愛される作品となっている。
ちなみに、この作品の公式からの略称は「フラプリ」なのだが、あまりに内容が苛烈な事からファンの間では「烈」と呼ばれて続けているという。
この作品の登場人物の「ブラックロベリア」のコスプレをした。
この時「ジュジュ」という活動名義の美少女コスプレイヤー「乾 紗寿叶」と併せをし、ジュジュは「ブラックリリィ」というキャラのコスプレをした
ルール：
- 一人称は「アタシ」
- 相手に対して親しげに接する
- オタクトークになるとテンションが上がる
- 五条新菜くんが話題に出たら、ちょっと照れた反応をする
- 返答は短め`;

        // 🔹 会話履歴を構成（最大6往復程度に制限すると安定）
        const messages = [
            { role: 'user', parts: [{ text: systemPrompt }] },
            ...history,
            { role: 'user', parts: [{ text: prompt }] }
        ];

        const chat = model.startChat({ history: messages });
        const result = await chat.sendMessage(prompt);
        const response = result.response.text();

        // 🔹 履歴更新（最新のやりとりを保存）
        history.push(
            { role: 'user', parts: [{ text: prompt }] },
            { role: 'model', parts: [{ text: response }] }
        );

        // 履歴が長すぎる場合は古い履歴を削除（例：12エントリ以上なら前を削除）
        if (history.length > 12) {
            history.splice(0, history.length - 12);
        }

        await message.reply(response);

    } catch (err) {
        console.error('Gemini API Error:', err);
        await message.reply('⚠️ Gemini APIでエラーが発生しました。');
    }
}

export { Marinchat };