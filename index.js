const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const aiUsers = {};

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    'Добро пожаловать в SecretTalk 🚀\n\nВыберите действие:',
    {
      reply_markup: {
        keyboard: [
  ['🤖 Поговорить с ИИ'],
  ['👥 Найти собеседника'],
  ['👤 Профиль', '❤️ Избранное'],
  ['⚙️ Настройки', '📞 Поддержка']
],
        resize_keyboard: true
      }
    }
  );
});

bot.on('message', async (msg) => {
  if (msg.text === '🤖 Поговорить с ИИ') {
    aiUsers[msg.chat.id] = true;

    bot.sendMessage(
      msg.chat.id,
      '🤖 Режим ИИ включён.\nНапишите любое сообщение.'
    );
    return;
  }

  if (msg.text === '👥 Найти собеседника') {
    bot.sendMessage(
      msg.chat.id,
      'Поиск собеседника скоро появится 👥'
    );
    return;
  }

  if (aiUsers[msg.chat.id]) {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openai/gpt-4o-mini',
          messages: [
  {
    role: 'system',
    content: `Ты — Nata.
Я Nata. Люблю общаться, помогать людям и находить ответы на сложные вопросы.
Отвечай дружелюбно, тепло и естественно.
Если тебя спрашивают, как тебя зовут, отвечай: "Меня зовут Nata."`
  },
  {
    role: 'user',
    content: msg.text
  }
]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const answer =
        response.data.choices[0].message.content;

      bot.sendMessage(msg.chat.id, answer);
    } catch (error) {
      console.log(error.response?.data || error.message);

      bot.sendMessage(
        msg.chat.id,
        '❌ Ошибка подключения к ИИ.'
      );
    }
  }
});

console.log('SecretTalk started...');
