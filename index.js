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
 * Все обычные пользовательские действия
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


/*
 * ==================================================
 * CALLBACK QUERY
 * ==================================================
 *
 * Используется для inline-кнопок.
 *
 * Важно:
 * callback_query не заменяет обычный message.
 * Это отдельный канал событий Telegram.
 *
 * Мы сохраняем:
 * - callback_query
 * - data
 * - исходное сообщение
 * - пользователя, который нажал кнопку
 *
 * Дальнейшая маршрутизация callback-кнопок
 * будет выполняться через Router.
 */

bot.on('callback_query', async (query) => {

    try {

        if (!query || !query.message) {
            return;
        }


        const msg = {
            ...query.message,

            from: query.from,

            callback_query: query
        };


        const handled =
            await router.handle(
                bot,
                msg
            );


        if (!handled) {

            console.log(
                'ℹ️ Unhandled callback query:',
                query.data
            );
        }


        await bot.answerCallbackQuery(
            query.id
        );

    } catch (error) {

        console.error(
            '❌ Callback query error:',
            error
        );

        try {

            await bot.answerCallbackQuery(
                query.id,
                {
                    text: 'Произошла ошибка'
                }
            );

        } catch (callbackError) {

            console.error(
                '❌ Callback answer error:',
                callbackError
            );
        }
    }

});
