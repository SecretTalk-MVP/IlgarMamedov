const menu = require("./menu");
const permissions = require("./permissions");
const statistics = require("./statistics");
const adminUsers = new Set();

class ChatRoutes {

    async handle(bot, msg, aiUsers) {

        if (!msg || !msg.text) {
            return false;
        }

        const adminButtons = [
    "/admin",
    "Админ",
    "Admin",
    "👑 Админ",
    "👑 Admin",
    "📊 Статистика",
    "👥 Пользователи",
    "💬 Активные чаты",
    "📢 Рассылка",
    "🚫 Бан / Разбан",
    "⚙️ Настройки",
"⬅️ Назад"
];

        if (!adminButtons.includes(msg.text)) {
            return false;
        }

        console.log("ADMIN:", msg.text);

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
                aiUsers
            );
        }

        if (
    msg.text === "/admin" ||
    msg.text === "Админ" ||
    msg.text === "Admin" ||
    msg.text === "👑 Админ" ||
    msg.text === "👑 Admin"
) {

            await menu.show(
                bot,
                msg.chat.id
            );

            return true;
        }

        await bot.sendMessage(
            msg.chat.id,
            "🚧 Эта функция администратора пока находится в разработке."
        );

        return true;
    }

}

module.exports = new ChatRoutes();
