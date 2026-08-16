const adminRoutes = require('./modules/admin/chat.routes');
const aida = require('./modules/aida');

class Router {

    async handle(bot, msg) {

        /*
         * ADMIN
         *
         * Первый подключённый модуль
         * единого Router.
         */
        if (await adminRoutes.handle(
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
