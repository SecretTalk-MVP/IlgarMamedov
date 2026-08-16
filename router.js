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
         * Единый Router проекта обрабатывает Admin напрямую.
         * modules/admin/chat.routes.js больше не используется.
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
         * ВЫХОД ИЗ ADMIN
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

        if (adminButtons.includes(msg.text)) {

            console.log("ADMIN:", msg.text);

            /*
             * Проверка прав администратора
             */

            if (!permissions.isAdmin(msg.from.id)) {

                await bot.sendMessage(
                    msg.chat.id,
                    "⛔ У вас нет доступа."
                );

                return true;
            }

            /*
             * Вход в панель администратора
             */

            if (
                msg.text === "/admin" ||
                msg.text === "Админ" ||
                msg.text === "Admin" ||
                msg.text === "👑 Админ" ||
                msg.text === "👑 Admin"
            ) {

                adminUsers.add(msg.from.id);

                const adminKeyboard = [
                    ["📊 Статистика", "👥 Пользователи"],
                    ["💬 Активные чаты", "📢 Рассылка"],
                    ["🚫 Бан / Разбан", "⚙️ Настройки"],
                    ["⬅️ Назад"]
                ];

                await bot.sendMessage(
                    msg.chat.id,
                    "Добро пожаловать в SecretTalk ❤️\n\nПанель администратора:",
                    {
                        reply_markup: {
                            keyboard: adminKeyboard,
                            resize_keyboard: true
                        }
                    }
                );

                return true;
            }

            /*
             * Статистика
             */

            if (msg.text === "📊 Статистика") {

                return await statistics.show(
                    bot,
                    msg,
                    aiUsers
                );
            }

            /*
             * Остальные функции Admin
             */

            await bot.sendMessage(
                msg.chat.id,
                "🚧 Эта функция администратора пока находится в разработке."
            );

            return true;
        }

        /*
         * =========================================================
         * Здесь ниже будут подключаться остальные модули:
         *
         * AiDa
         * Matchmaking
         * Settings
         * Users
         * и т.д.
         *
         * Они подключаются к ЭТОМУ Router,
         * а не создают собственные Router.
         * =========================================================
         */

        return false;
    }
}

module.exports = new Router();
