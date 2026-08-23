const aida = require("../aida");
const admin = require("../admin");
const settings = require("../settings");
const matchmaking = require("../matchmaking/controller");
const matchmakingKeyboard = require("../matchmaking/keyboard");
const nika = require("../nika/nika");

class Router {

    async handle(bot, msg) {

        if (!msg || !msg.text || !msg.from) {
            return false;
        }

        const text = msg.text;

        /*
         * AiDa — существующий независимый маршрут.
         * НЕ МЕНЯЕМ.
         */

        if (text === "🤖 Поговорить с ИИ") {

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

        if (await aida.handle(bot, msg)) {
            return true;
        }


        /*
         * Найти собеседника
         */

        if (text === "👥 Найти собеседника") {

            await bot.sendMessage(
                msg.chat.id,
                "Кого вы хотите найти?",
                matchmakingKeyboard.search()
            );

            return true;
        }


        /*
         * Случайный реальный собеседник
         */

        if (text === "🎲 Случайного собеседника") {

            return await matchmaking.findRandom(
                bot,
                msg,
                aida.users
            );
        }


        /*
         * Выбор цифрового персонажа
         */

        if (text === "🤖 Выбрать персонажа") {

            await bot.sendMessage(
                msg.chat.id,
                "🤖 Выберите персонажа:",
                {
                    reply_markup: {
                        keyboard: [
                            ["👩 Ника"],
                            ["⬅️ Назад"]
                        ],
                        resize_keyboard: true
                    }
                }
            );

            return true;
        }


        /*
         * Ника
         */

        if (text === "👩 Ника") {

            return await nika.handle(
                bot,
                msg
            );
        }


        /*
         * Администрирование
         */

        if (await admin.handle(
            bot,
            msg,
            aida.users
        )) {
            return true;
        }


        /*
         * Настройки / фильтр поиска
         */

        if (await settings.handle(
            bot,
            msg,
            aida.users
        )) {
            return true;
        }


        /*
         * Активный human-to-human диалог
         */

        return await matchmaking.handle(
            bot,
            msg,
            aida.users
        );
    }
}

module.exports = new Router();
