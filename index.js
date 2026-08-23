const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, {
    polling: true
});

const router = require('./router');

console.log('✅ SecretTalk started');


/*
 * ==================================================
 * ЕДИНАЯ ТОЧКА ОБРАБОТКИ СООБЩЕНИЙ
 * ==================================================
 *
 * Все пользовательские действия проходят
 * через единый Router.
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
