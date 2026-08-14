const admin = require("../admin");
const settings = require("../settings");
const aida = require("../aida");

class Router {

    async handle(bot, msg) {

        if (await admin.handle(bot, msg, aida.users)) {
            return true;
        }

        if (await settings.handle(bot, msg, aida.users)) {
            return true;
        }

        if (await aida.handle(bot, msg)) {
            return true;
        }

        return false;
    }

}

module.exports = new Router();
