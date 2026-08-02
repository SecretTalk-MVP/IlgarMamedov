const menu = require("./menu");
const permissions = require("./permissions");
const statistics = require("./statistics");

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

        if (msg.text === "📊 Статистика") {
    return await statistics.show(bot, msg);
}

await menu.show(bot, msg.chat.id);

return true;
    }

}

module.exports = new ChatRoutes();
