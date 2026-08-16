const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, {
    polling: true
});

const router = require('./router');
const menu = require('./menu');

console.log('✅ SecretTalk started');
console.log('✅ Root index.js initialized');


/*
 * ==================================================
 * /start
 * ==================================================
 *
 * Главное меню создаётся только через menu.js.
 */
bot.onText(/\/start/, async (msg) => {

    console.log(
        'START USER ID:',
        msg.from.id
    );

    await menu.showMainMenu(
    bot,
    msg.chat.id
);
});


/*
 * ==================================================
 * ЕДИНАЯ ТОЧКА ОБРАБОТКИ СООБЩЕНИЙ
 * ==================================================
 *
 * Все пользовательские действия сначала
 * проходят через единый Router.
 */
bot.on('message', async (msg) => {

    try {

        const handled = await router.handle(
            bot,
            msg
        );

        if (handled) {
            return;
        }

    } catch (error) {

        console.error(
            '❌ Router error:',
            error
        );

        await bot.sendMessage(
            msg.chat.id,
            '❌ Произошла ошибка. Попробуйте ещё раз.'
        );
    }

});
