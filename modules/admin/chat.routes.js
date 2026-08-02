const menu = require("./menu");

class ChatRoutes {

    async handle(bot, msg) {

        if (msg.text !== "/admin") {
            return false;
        }

        await menu.show(bot, msg.chat.id);

        return true;
    }

}

module.exports = new ChatRoutes();
