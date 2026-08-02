const admin = require("../admin");

class Routes {

    async handle(bot, msg) {

        if (await admin.handle(bot, msg)) {
            return true;
        }

        return false;

    }

}

module.exports = new Routes();
