const menu = require("./menu");
const permissions = require("./modules/admin/permissions");
const statistics = require("./modules/admin/statistics");

const adminUsers = new Set();

class Router {

    async handle(bot, msg, aiUsers) {

        if (!msg || !msg.text || !msg.from) {
            return false;
        }

        /*
         * =========================================================
         * ADMIN
         * Единый Router проекта.
         * Admin больше не имеет собственного Router.
         * =========================================================
         */

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
            "⚙️ Настройки"
        ];

        /*
         * =========================================================
         * НАЗАД ИЗ ADMIN
         * =========================================================
         */

        if (msg.text === "⬅️ Назад" && adminUsers.has(msg.from.id)) {

            adminUsers.delete(msg.from.id);

            await menu.showMainMenu(
                bot,
                msg.chat.id
            );

            return true;
        }

        /*
         * =========================================================
         * ADMIN BUTTONS
         * =========================================================
         */

        if (!adminButtons.includes(msg.text)) {
            return false;
        }

        console.log("ADMIN:", msg.text);

        /*
         * Проверка прав
         */

        if (!permissions.isAdmin(msg.from.id)) {

            await bot.sendMessage(
                msg.chat.id,
                "⛔ У вас нет доступа."
            );

            return true;
        }

        /*
         * =========================================================
         * ВХОД В ADMIN
         * =========================================================
         */

        if (
            msg.text === "/admin" ||
            msg.text === "Админ" ||
            msg.text === "Admin" ||
            msg.text === "👑 Админ" ||
            msg.text === "👑 Admin"
        ) {

            adminUsers.add(msg.from.id);

            await menu.showAdminMenu(
                bot,
                msg.chat.id
            );

            return true;
        }

        /*
         * =========================================================
         * СТАТИСТИКА
         * =========================================================
         */

        if (msg.text === "📊 Статистика") {

            return await statistics.show(
                bot,
                msg,
                aiUsers
            );
        }

        /*
         * =========================================================
         * ОСТАЛЬНЫЕ ФУНКЦИИ ADMIN
         * =========================================================
         */

        await bot.sendMessage(
            msg.chat.id,
            "🚧 Эта функция администратора пока находится в разработке."
        );

        return true;
    }
}

module.exports = new Router();
