const admin = require('./modules/admin');

class Router {

    async handle(bot, msg) {

        /*
         * ADMIN
         *
         * Единственный Router проекта
         * передаёт управление модулю Admin.
         */
        if (await admin.handle(bot, msg)) {
            return true;
        }

        return false;
    }

}

module.exports = new Router();
