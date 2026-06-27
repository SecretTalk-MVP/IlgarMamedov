const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    'Добро пожаловать в SecretTalk 🚀\n\nВыберите действие:',
    {
      reply_markup: {
        keyboard: [
          ['🤖 Поговорить с ИИ'],
          ['👥 Найти собеседника']
        ],
        resize_keyboard: true
      }
    }
  );
});

bot.on('message', (msg) => {
  if (msg.text === '🤖 Поговорить с ИИ') {
    bot.sendMessage(
      msg.chat.id,
      'Функция ИИ скоро появится 🤖'
    );
  }

  if (msg.text === '👥 Найти собеседника') {
    bot.sendMessage(
      msg.chat.id,
      'Поиск собеседника скоро появится 👥'
    );
  }
});

console.log('SecretTalk started...');
