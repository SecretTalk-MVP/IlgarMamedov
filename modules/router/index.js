const aida = require("../aida");
const admin = require("../admin");
const settings = require("../settings");
const matchmaking = require("../matchmaking/routes");

class Router {

    async handle(bot, msg) {

        /*
         * 1. Переход в режим AiDa.
         *
         * Сначала очищаем состояние
         * human-to-human matchmaking.
         */
        if (msg.text === "🤖 Поговорить с ИИ") {

            const partnerId = matchmaking.leaveForAi(
                msg.chat.id
            );

            if (partnerId) {

                await bot.sendMessage(
                    partnerId,
                    "❌ Собеседник перешёл в режим ИИ."
                );
            }

            return await aida.handle(
                bot,
                msg
            );
        }

        /*
         * 2. AiDa.
         *
         * Обрабатывает сообщения пользователя,
         * находящегося в режиме AiDa.
         */
        if (await aida.handle(bot, msg)) {
            return true;
        }

        /*
         * 3. Администрирование.
         */
        if (await admin.handle(
            bot,
            msg,
            aida.users
        )) {
            return true;
        }

        /*
         * 4. Настройки / фильтр поиска.
         */
        if (await settings.handle(
            bot,
            msg,
            aida.users
        )) {
            return true;
        }

        return false;
    }

}

module.exports = new Router();
