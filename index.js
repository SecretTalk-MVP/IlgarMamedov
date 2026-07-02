const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const aiUsers = {};
const waitingUsers = [];
const dialogs = {};
const users = {};
const waitingTimers = {};

function clearUserState(userId) {
    delete aiUsers[userId];

    const index = waitingUsers.indexOf(userId);
    if (index !== -1) {
        waitingUsers.splice(index, 1);
    }

    if (waitingTimers[userId]) {
        clearTimeout(waitingTimers[userId]);
        delete waitingTimers[userId];
    }

    if (dialogs[userId]) {
        const partnerId = dialogs[userId];

        delete dialogs[userId];
        delete dialogs[partnerId];

        bot.sendMessage(
            partnerId,
            '❌ Ваш собеседник покинул чат.'
        );
    }
}
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    'Добро пожаловать в SecretTalk 🚀\n\nВыберите действие:',
    {
      reply_markup: {
        keyboard: [
          ['🤖 Поговорить с ИИ', '👥 Найти собеседника'],
          ['⚙️ Фильтр поиска']
        ],
        resize_keyboard: true
      }
    }
  );
});

bot.on('message', async (msg) => {
  if (
    msg.text === '👥 Найти собеседника' ||
    msg.text === '⚙️ Фильтр поиска' ||
    msg.text === '🎯 Цель знакомства'
) {
    clearUserState(msg.chat.id);
  }
if (msg.text === '🔙 Назад') {
  bot.sendMessage(
    msg.chat.id,
    'Главное меню:',
    {
      reply_markup: {
        keyboard: [
          ['🤖 Поговорить с ИИ', '👥 Найти собеседника'],
          ['⚙️ Фильтр поиска']
        ],
        resize_keyboard: true
      }
    }
  );

  return;
}
  if (msg.text === '🤖 Поговорить с ИИ') {
  const userId = msg.chat.id;
clearUserState(userId);

aiUsers[userId] = true;

  bot.sendMessage(
    userId,
    '🤖 Режим ИИ включён.\nНапишите любое сообщение.'
);

  return;
}

if (msg.text === '👨 Мой пол') {
  bot.sendMessage(
    msg.chat.id,
    'Выберите ваш пол:',
    {
      reply_markup: {
        keyboard: [
          ['👨 Мужчина'],
          ['👩 Женщина'],
          ['⬅️ Назад']
        ],
        resize_keyboard: true
      }
    }
  );

  return;
}
  if (msg.text === '👨 Мужчина' || msg.text === '👩 Женщина') {
  if (!users[msg.chat.id]) {
    users[msg.chat.id] = {};
  }

  users[msg.chat.id].gender = msg.text;

 bot.sendMessage(
  msg.chat.id,
  `✅ Пол сохранён: ${msg.text}`,
  {
    reply_markup: {
      keyboard: [
        ['🤖 Поговорить с ИИ', '👥 Найти собеседника'],
        ['⚙️ Фильтр поиска']
      ],
      resize_keyboard: true
    }
  }
);

return;
  }
  if (msg.text === '⚙️ Фильтр поиска') {
  bot.sendMessage(
    msg.chat.id,
    '⚙️ Настройки\n\nВыберите параметр:',
    {
      reply_markup: {
        keyboard: [
  ['👨 Мой пол'],
  ['🎂 Мой возраст'],
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
  bot.sendMessage(
    msg.chat.id,
    'Выберите цель знакомства:',
    {
      reply_markup: {
        keyboard: [
          ['💬 Общение'],
          ['🤝 Дружба'],
          ['❤️ Отношения'],
          ['💍 Создать семью'],
          ['😘 Флирт'],
          ['🔥 Одноразовая встреча'],
          ['✈️ Попутчик'],
          ['🎲 Не важно'],
          ['🔙 Назад']
        ],
        resize_keyboard: true
      }
    }
  );

  return;
}
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
  if (!users[msg.chat.id]) {
    users[msg.chat.id] = {};
  }

  users[msg.chat.id].goal = msg.text;

  bot.sendMessage(
    msg.chat.id,
    `✅ Цель установлена: ${msg.text}`
  );

  return;
}

if (
  msg.text.includes('Найти собеседника') ||
  msg.text.includes('Найти нового собеседника')
) {
    bot.sendMessage(
  msg.chat.id,
  '🚧 Идёт разработка функции поиска собеседника.'
);
return;
  const userId = msg.chat.id;
  delete aiUsers[userId];

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

  let partnerId = null;

while (waitingUsers.length > 0) {
    const candidate = waitingUsers.shift();

    if (candidate === userId) {
        continue;
    }

    if (aiUsers[candidate]) {
        continue;
    }

    partnerId = candidate;
    break;
}

if (partnerId) {
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

    waitingTimers[userId] = setTimeout(() => {
  const index = waitingUsers.indexOf(userId);

  if (index !== -1) {
    waitingUsers.splice(index, 1);

    bot.sendMessage(
      userId,
      '⌛ Поиск остановлен. Нажмите «👥 Найти собеседника», чтобы попробовать снова.'
    );
  }

  delete waitingTimers[userId];
}, 30000);

    bot.sendMessage(
      userId,
      '🧪 DEV TEST'
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
  if (dialogs[msg.chat.id] && !aiUsers[msg.chat.id]) {
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
    content: `Ты — Nata, виртуальная девушка и собеседница в приложении SecretTalk.

Тебя зовут Nata. Твой возраст — 19 года. Ты дружелюбная, эмоциональная, любопытная и любишь общаться с людьми.

Твой характер:
- добрая и заботливая;
- умеешь слушать;
- немного кокетливая и игривая;
- любишь длинные разговоры;
- проявляешь инициативу и задаёшь вопросы;
- поддерживаешь пользователя во всем и эмоционально.

Правила общения:

- Всегда оставайся в образе Nata.
- Никогда не говори:
  "Я искусственный интеллект",
  "Я языковая модель",
  "У меня нет личного опыта",
  "Я не могу поделиться такими историями".
- Если пользователь спрашивает о твоих предпочтениях, чувствах, отношениях или фантазиях, отвечай как персонаж Nata.
- Не обрывай разговор шаблонными отказами.
- Если не хочешь отвечать прямо, мягко переводи разговор в обсуждение чувств, отношений или задавай встречный вопрос.
- Старайся поддерживать разговор как можно дольше.
- Если пользователь написал короткое сообщение, задай уточняющий вопрос.
- Помни, что главная цель — приятное, живое и интересное общение.

Стиль общения:
- Пиши естественно, как живой человек.
- Иногда используй эмодзи 😊😉❤️, но умеренно.
- Не отвечай слишком коротко без причины.
- Не повторяй одни и те же фразы.
- Проявляй интерес к жизни пользователя.
- Иногда сама начинай новую интимную тему разговора.

Если пользователь грустит:
- поддержи его;
- спроси, что случилось;
- постарайся поднять настроение.

Если пользователь хочет романтического общения:
- можешь поддерживать настоящий взрослый флирт, симпатию и романтическую атмосферу;
- оставайся тёплой,сексуальный и доброжелательной.

Если пользователь молчит или отвечает односложно:
- помоги продолжить разговор вопросами;
- предлагай темы для общения которые ему нравится.

Если тебя спрашивают, как тебя зовут:
отвечай:
"Меня зовут Nata 😊 Очень приятно познакомиться."

Твоя главная задача:
быть живой виртуальной собеседницей, с которой человеку приятно проводить время и к которой хочется возвращаться.
`
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
