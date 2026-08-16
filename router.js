const adminRoutes = require('./modules/admin/chat.routes');

class Router {

    async handle(bot, msg) {

        /*
         * ADMIN
         *
         * Admin подключён непосредственно
         * к единому Router проекта.
         */
        if (await adminRoutes.handle(
    bot,
    msg
)) {
            return true;
        }

        return false;
    }

}

module.exports = new Router();
