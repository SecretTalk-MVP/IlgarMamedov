const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const aiUsers = {};
const waitingUsers = [];
const dialogs = {};
const users = {};
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    'Добро пожаловать в SecretTalk 🚀\n\nВыберите действие:',
    {
      reply_markup: {
  keyboard: [
  ['🤖 Поговорить с ИИ', '👥 Найти собеседника'],
  ['⚙️ Фильтр поиска'],
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
  if (msg.text === '⚙️ Настройки') {
  bot.sendMessage(
    msg.chat.id,
    '⚙️ Настройки\n\nВыберите параметр:',
    {
      reply_markup: {
        keyboard: [
          ['🎯 Цель знакомства'],
          ['🌍 Мой город'],
          ['📍 Радиус поиска'],
          ['🔙 Назад']
        ],
        resize_keyboard: true
      }
    }
  );

  return;
  }

if (msg.text === '🎯 Цель знакомства') {
  const goals = [
  '💬 Общение',
  '🤝 Дружба',
  '❤️ Отношения',
  '💍 Создать семью',
  '😘 Флирт',
  '🔥 Одноразовая встреча',
  '✈️ Попутчик',
  '🎲 Не важно'
];

if (goals.includes(msg.text)) {
  users[msg.chat.id].goal = msg.text;

  bot.sendMessage(
    msg.chat.id,
    `✅ Цель установлена: ${msg.text}`
  );

  return;
}
   // код целей
   return;
}

if (
  msg.text.includes('Найти собеседника') ||
  msg.text.includes('Найти нового собеседника')
) {
   ...
}
) {
  const userId = msg.chat.id;
  if (!users[userId]) {
  users[userId] = {
    goal: '🎲 Не важно',
    city: null,
    radius: null,
    gender: null,
    searchGender: 'all',
    violations: 0,
    blockedUntil: null
  };
  }

  if (dialogs[userId]) {
    const partnerId = dialogs[userId];

    delete dialogs[userId];
    delete dialogs[partnerId];

    bot.sendMessage(
      partnerId,
      '❌ Собеседник начал поиск нового собеседника.'
    );
  }

  if (waitingUsers.includes(userId)) {
    return;
  }

  if (waitingUsers.length > 0) {
    const partnerId = waitingUsers.shift();

    dialogs[userId] = partnerId;
    dialogs[partnerId] = userId;

    bot.sendMessage(
      userId,
      '✅ Новый собеседник найден!'
    );

    bot.sendMessage(
      partnerId,
      '✅ Новый собеседник найден!'
    );
  } else {
    waitingUsers.push(userId);

    bot.sendMessage(
      userId,
      '🔍 Ищем нового собеседника...'
    );
  }
  return;
}

if (msg.text === '❌ Завершить диалог') {
  const userId = msg.chat.id;
  const partnerId = dialogs[userId];

  if (!partnerId) {
    bot.sendMessage(userId, 'У вас нет активного диалога.');
    return;
  }

  delete dialogs[userId];
  delete dialogs[partnerId];

  bot.sendMessage(userId, '❌ Диалог завершён.');
  bot.sendMessage(partnerId, '❌ Собеседник покинул чат.');

  return;
}
  if (dialogs[msg.chat.id]) {
  const partnerId = dialogs[msg.chat.id];

  bot.sendMessage(
  partnerId,
  `💬 ${msg.text}`
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
