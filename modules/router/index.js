const admin = require("../admin");
const settings = require("../settings");
const aida = require("../aida");

class Router {

    async handle(bot, msg, aiUsers) {

        /*
         * 1. Администрирование
         */
        if (await admin.handle(bot, msg, aiUsers)) {
            return true;
        }

        /*
         * 2. Настройки / фильтр поиска
         */
        if (await settings.handle(bot, msg, aiUsers)) {
            return true;
        }

        /*
         * 3. AiDa
         */
        if (await aida.handle(bot, msg)) {
            return true;
        }

        return false;
    }

}

module.exports = new Router();
