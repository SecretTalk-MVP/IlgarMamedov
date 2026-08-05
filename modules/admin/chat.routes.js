const menu = require("./menu");
const permissions = require("./permissions");
const statistics = require("./statistics");

class ChatRoutes {

    async handle(
    bot,
    msg,
    users,
    onlineUsers,
    dialogs,
    waitingUsers,
    aiUsers
) {

    console.log("ADMIN:", msg.text);

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
    return await statistics.show(
    bot,
    msg,
    users,
    onlineUsers,
    dialogs,
    waitingUsers,
    aiUsers
);
}

if (msg.text === "⬅️ Назад") {
    await bot.sendMessage(
        msg.chat.id,
        "Добро пожаловать в SecretTalk 🚀\n\nВыберите действие:",
        {
            reply_markup: {
                keyboard: [
                    ['🤖 Поговорить с ИИ', '👥 Найти собеседника'],
                    ['⚙️ Фильтр поиска'],
                    ['Админ']
                ],
                resize_keyboard: true
            }
        }
    );

    return true;
}
        await menu.show(bot, msg.chat.id);

return true;
    }

}

module.exports = new ChatRoutes();
