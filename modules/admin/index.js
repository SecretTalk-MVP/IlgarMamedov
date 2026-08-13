const chatRoutes = require("./chat.routes");
const permissions = require("./permissions");

class AdminModule {

    isAdmin(userId) {
        return permissions.isAdmin(userId);
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
