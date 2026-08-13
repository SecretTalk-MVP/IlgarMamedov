const chatRoutes = require("./chat.routes");

class AdminModule {

    async handle(bot, msg, aiUsers) {

        return await chatRoutes.handle(
            bot,
            msg,
            aiUsers
        );

    }

}

module.exports = new AdminModule();
