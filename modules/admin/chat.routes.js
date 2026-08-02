const menu = require("./menu");
const permissions = require("./permissions");

class ChatRoutes {

    async handle(bot, msg) {

        if (!msg || !msg.text) {
            return false;
        }

        if (msg.text !== "/admin" && msg.text !== "Админ") {
    return false;
}

        if (!permissions.isAdmin(msg.from.id)) {

            await bot.sendMessage(
                msg.chat.id,
                "⛔ У вас нет доступа."
            );

            return true;
        }

        await menu.show(bot, msg.chat.id);

        return true;
    }

}

module.exports = new ChatRoutes();
