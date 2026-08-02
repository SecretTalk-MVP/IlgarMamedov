const admin = require("../admin");

class Router {

    async handle(bot, msg) {

        if (await admin.handle(bot, msg)) {
            return true;
        }

        return false;
    }

}

module.exports = new Router();
