const statistics = require("./statistics");
const menu = require("./menu");
const permissions = require("./permissions");
const chatRoutes = require("./chat.routes");

class AdminModule {

    constructor() {
        this.statistics = statistics;
        this.menu = menu;
        this.permissions = permissions;
    }

    async handle(bot, msg, aiUsers) {

        return await chatRoutes.handle(
            bot,
            msg,
            aiUsers
        );

    }

}

module.exports = new AdminModule();
