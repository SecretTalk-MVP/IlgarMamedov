const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const db = require('./database/db');
const aida = require('./ai_characters/aida');
const MemoryService = require('./memory/memory.service');
const MemoryEngine = require('./memory/memory.engine');
const AIService = require('./ai/ai.service');
const { saveUser } = require('./controllers/user.controller');
const {
    pushHistory,
    goBack
} = require('./controllers/navigation.controller');
const {
    registerStartController
} = require('./controllers/start.controller');
const admin = require("./modules/admin");

const memoryService = new MemoryService();
const memoryEngine = new MemoryEngine();
const aiService = new AIService();

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
console.log("=== STEP 2: TelegramBot created ===");

registerStartController(bot);

const aiUsers = {};
const memories = {};
const waitingUsers = [];
const dialogs = {};
const users = {};
const waitingTimers = {};
let chatHistory = {};
const onlineUsers = new Set();

function saveChat(user1, user2, message) {
    const chatId = [user1, user2].sort().join('_');

    if (!chatHistory[chatId]) {
        chatHistory[chatId] = [];
    }

    chatHistory[chatId].push({
        from: user1,
        to: user2,
        text: message.text || '',
        date: new Date().toISOString(),
        type:
            message.text ? 'text' :
            message.photo ? 'photo' :
            message.video ? 'video' :
            message.voice ? 'voice' :
            message.video_note ? 'video_note' :
            message.document ? 'document' :
            message.location ? 'location' :
            'other'
    });

    fs.writeFileSync(
        'chats.json',
        JSON.stringify(chatHistory, null, 2)
    );
}

if (fs.existsSync('chats.json')) {
    chatHistory = JSON.parse(
        fs.readFileSync('chats.json', 'utf8')
    );
}

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

bot.on('message', async (msg) => {
  if (
  users[msg.chat.id] &&
  users[msg.chat.id].waitingFor === 'age'
) {
  const age = parseInt(msg.text);

  if (isNaN(age) || age < 18 || age > 99) {
    bot.sendMessage(
      msg.chat.id,
      '❌ Введите возраст числом от 18 до 99.'
    );
    return;
  }

  users[msg.chat.id].age = age;
  delete users[msg.chat.id].waitingFor;

  bot.sendMessage(
    msg.chat.id,
    `✅ Возраст сохранён: ${age}`,
    {
      reply_markup: {
        keyboard: msg.from.id === 1496574112
    ? [
        ['🤖 Поговорить с ИИ', '👥 Find People'],
        ['⚙️ Фильтр поиска'],
        ['Админ']
      ]
    : [
        ['🤖 Поговорить с ИИ', '👥 Find People'],
        ['⚙️ Фильтр поиска']
      ],
        resize_keyboard: true
      }
    }
  );

  return;
}

console.log("MESSAGE:", msg.from.id);
 // const memory = await memoryService.loadMemory(msg.from.id);
await saveUser(msg);
    console.log("MY TELEGRAM ID:", msg.from.id);

if (
    await admin.handle(
        bot,
        msg,
        users,
        onlineUsers,
        dialogs,
        waitingUsers,
        aiUsers
    )
) {
    return;
}
    
if (msg.text === '👥 Онлайн') {
onlineUsers.add(msg.from.id);
  console.log("TEXT =", JSON.stringify(msg.text));

    let text = `🟢 Онлайн сейчас: ${onlineUsers.size}\n\n`;

    let i = 1;

    for (const id of onlineUsers) {
        text += `${i}. ${id}\n`;
        i++;
    }

    bot.sendMessage(msg.chat.id, text);

    return;
  
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
}, 300000);

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

  try {
    await bot.copyMessage(
      partnerId,
      msg.chat.id,
      msg.message_id
    );
  } catch (err) {
    console.log(err);
  }

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
const answer = await aiService.ask(
    msg.chat.id,
    chatHistory[msg.chat.id]
);

console.log("AI ANSWER:", answer);

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
