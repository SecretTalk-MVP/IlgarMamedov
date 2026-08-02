const menu = require("./menu");
const permissions = require("./permissions");

class ChatRoutes {

    async handle(bot, msg) {

        if (msg.text !== "/admin") {
            return false;
        }

        if (!permissions.isAdmin(msg.from.id)) {
            return true;
        }

        await menu.show(bot, msg.chat.id);

        return true;
    }

}

module.exports = new ChatRoutes();
