const aida = require("../aida");
const admin = require("../admin");
const settings = require("../settings");

class Router {

    async handle(bot, msg) {

        /*
         * 1. AiDa
         *
         * Сначала проверяем AiDa,
         * чтобы она могла корректно
         * выйти из своего режима при
         * переходе пользователя в другой модуль.
         */
        if (await aida.handle(bot, msg)) {
            return true;
        }

        /*
         * 2. Администрирование
         */
        if (await admin.handle(bot, msg, aida.users)) {
            return true;
        }

        /*
         * 3. Настройки / фильтр поиска
         */
        if (await settings.handle(bot, msg, aida.users)) {
            return true;
        }

        return false;
    }

}

module.exports = new Router();
