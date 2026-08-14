const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const router = require('./modules/router');
const matchmaking = require('./modules/matchmaking/routes');
const admin = require('./modules/admin');
const aida = require('./modules/aida');

console.log("✅ Bot initialized");
console.log("✅ AiDa initialized");

bot.onText(/\/start/, async (msg) => {

    console.log(
        "START USER ID:",
        msg.from.id
    );

    const keyboard = [
        ["🤖 Поговорить с ИИ", "👥 Найти собеседника"],
        ["⚙️ Фильтр поиска"]
    ];

    if (admin.isAdmin(msg.from.id)) {
        keyboard[1].push("👑 Админ");
    }

    await bot.sendMessage(
        msg.chat.id,
        "Добро пожаловать в SecretTalk 💌\n\nВыберите действие:",
        {
            reply_markup: {
                keyboard,
                resize_keyboard: true
            }
        }
    );

});

bot.on("message", async (msg) => {

    const routerHandled = await router.handle(
        bot,
        msg
    );

    if (routerHandled) {
        return;
    }

    const matchmakingHandled = await matchmaking.handle(
        bot,
        msg,
        aida.users
    );

    if (matchmakingHandled) {
        return;
    }

});
