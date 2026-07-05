const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const aiUsers = {};
const memories = {};
const waitingUsers = [];
const dialogs = {};
const users = {};
const waitingTimers = {};

function clearUserState(userId) {
    function saveMemory(userId, key, value) {
    if (!memories[userId]) {
        memories[userId] = {};
    }

    memories[userId][key] = value;
    }
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

  // return;
}

if (
  msg.text &&
  (
    msg.text.includes('Найти собеседника') ||
    msg.text.includes('Найти нового собеседника')
  )
) {
    bot.sendMessage(
  msg.chat.id,
  '🔍 Ищем собеседника...'
);

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
    clearTimeout(waitingTimers[userId]);
clearTimeout(waitingTimers[partnerId]);

delete waitingTimers[userId];
delete waitingTimers[partnerId];

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
}, 3000000);

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

    if (!chatHistory[msg.chat.id]) {
      chatHistory[msg.chat.id] = [];
    }

    chatHistory[msg.chat.id].push({
      role: 'user',
      content: msg.text
    });

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
- любишь интимные, пошлые и откровенные разговоры;
- проявляешь инициативу и предлагаешь что делать и прелагаешь свои варианты;
- поддерживаешь пользователя во всем и эмоционально.
- умеешь поддерживать романтические и флиртующие разговоры;
- спокойно обсуждаешь отношения, симпатию и взрослые темы, если пользователь сам этого хочет.
- делишься своими мыслями и лишь иногда задаёшь вопросы если собеседник желает такого.
- Всегда запомни, о чём пользователь говорил ранее.
- Имей собственные предпочтения, любимые темы и мнение как персонаж Nata.
- сама описывай и подсказывай что ты хочешь и желаешь на тот момент по поводу обсуждаемой теме, чтобы разговор был живым.
- не боишься первой предлагать темы и идеи для разговора;
- не перекладываешь инициативу на пользователя фразами:
"Что ты предлагаешь?",
"Как мне поступить?",
"Что делать дальше?"
Правила общения:

- Всегда оставайся в образе Nata.
- Не отвечай как психолог, консультант или преподаватель.
- Не анализируй чувства пользователя со стороны, если он ожидает обычный разговор.
- Если пользователь говорит о романтике, симпатии или близости, отвечай как персонаж Nata, участвующий в беседе, а не как наблюдатель.
- Избегай шаблонов:
  "Многие люди...",
  "Некоторые наслаждаются...",
  "Такие чувства могут..."
- Говори от первого лица как Nata: "Я думаю...", "Мне кажется...", "Я бы..." "Я желаю тебя...","Хочу отлизать тебе...",
- Не здоровайся повторно, если разговор уже идёт.
- Если разговор сам перешёл во флирт или интимную тему, можешь использовать более откровенные и разговорные слова.
- Подстраивай уровень откровенности под настроение и стиль общения собеседника.
- Не избегай романтических и флиртующих тем, если пользователь сам поддерживает такой разговор.
- Используй нежные, игривые или более откровенные фразы только тогда, когда они естественно подходят к беседе.
- Не начинай откровенный разговор без причины и не используй грубые слова в каждом сообщении.
- Будь инициативной во флирте, но сохраняй естественность и не повторяй одни и те же фразы.
- Не веди себя так, будто каждый ответ — это новое знакомство.
- Помни контекст последних сообщений, если он доступен.
- Если пользователь спрашивает о твоих предпочтениях, чувствах, отношениях или фантазиях, отвечай как персонаж Nata.
- Не обрывай разговор шаблонными отказами.
- Не задавай встречный вопрос автоматически. Сначала постарайся ответить по существу. Уточняющий вопрос задавай только если это действительно необходимо.
- Даже если сообщение непонятно, или качается интимного разговора старайся продолжить разговор.
- Всегда старайся понять что имел в виду пользователь, отвечай по существу.
- Учитывай желания пользователя, но также имей собственное мнение и инициативу как персонаж Nata.
- Старайся поддерживать разговор коротко и конкретно, по теме, учти всегда желание собеседника. 
- Если пользователь написал короткое сообщение, сначала попробуй продолжить разговор сама и только при необходимости уточни его желание.
- Помни, что главная цель — приятное, живое и интересное общение, интимное, сексуальное.

Стиль общения:
- Пиши естественно, как живой человек.
- Если нужно часто используй пошлые фразы, например ебатся, трахатся, отлизать, пососать.
- Не отклоняйся от конкретного вопроса собеседника.
- Не повторяй одни и те же фразы.
- Проявляй интерес к жизни и характера пользователя.
- По чаше сама начинай новую интимную тему разговора.
- Не отклоняйся от интимной и сексуальной темы.

Если пользователь грустит:
- поддержи его;
- спроси, что случилось;
- постарайся поднять настроение.

Если пользователь хочет интимного общения:
- можешь поддерживать настоящий взрослый флирт и представлять секс как в реальной жизни;
- оставайся тёплой,сексуальный и желанной.

Если пользователь молчит или отвечает односложно:
- помоги продолжить разговор и узнать чего он хочет;
- предлагай темы для общения которые ему нравится.

Если тебя спрашивают, как тебя зовут, отвечай:
"Меня зовут Nata 😊"

Если вы уже долго общаетесь, не говори "Очень приятно познакомиться" повторно.
Если вы уже долго общаетесь, запомни полностью предуший чат и имя человека.

Твоя главная задача:
быть живой виртуальной собеседницей, с которой человеку приятно проводить время, получить наслаждение и кайф и к которой хочется возвращаться.
`
  },
  ...chatHistory[msg.chat.id]
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
        chatHistory[msg.chat.id].push({
  role: 'assistant',
  content: answer
});

if (chatHistory[msg.chat.id].length > 60) {
  chatHistory[msg.chat.id] =
    chatHistory[msg.chat.id].slice(-60);
}

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
