const admin = require("../admin");
const settings = require("../settings");

class Routes {

    async handle(bot, msg, aiUsers) {

        if (await admin.handle(bot, msg, aiUsers)) {
            return true;
        }

        if (await settings.handle(bot, msg, aiUsers)) {
            return true;
        }

        return false;
    }

}

module.exports = new Routes();
