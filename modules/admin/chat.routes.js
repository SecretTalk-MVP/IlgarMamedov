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
            "⚙️ Настройки"
        ];

        /*
         * Кнопка «Назад» обрабатывается
         * только если пользователь действительно
         * находится внутри панели администратора.
         *
         * Поэтому она больше не перехватывает
         * «Назад» из других модулей.
         */
        if (msg.text === "⬅️ Назад") {

            if (!adminUsers.has(msg.from.id)) {
                return false;
            }

            adminUsers.delete(msg.from.id);

            const keyboard = [
                ["🤖 Поговорить с ИИ", "👥 Найти собеседника"],
                ["⚙️ Фильтр поиска"]
            ];

            if (permissions.isAdmin(msg.from.id)) {
                keyboard[1].push("👑 Админ");
            }

            await bot.sendMessage(
                msg.chat.id,
                "Добро пожаловать в SecretTalk 💌\n\nВыберите действие:",
                {
                    reply_markup: {
                        keyboard,
                        resize_keyboard: true
                    }
                }
            );

            return true;
        }

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

        /*
         * Вход в панель администратора.
         */
        if (
            msg.text === "/admin" ||
            msg.text === "Админ" ||
            msg.text === "Admin" ||
            msg.text === "👑 Админ" ||
            msg.text === "👑 Admin"
        ) {

            adminUsers.add(msg.from.id);

            await menu.show(
                bot,
                msg.chat.id
            );

            return true;
        }

        /*
         * Статистика.
         */
        if (msg.text === "📊 Статистика") {

            return await statistics.show(
                bot,
                msg,
                aiUsers
            );
        }

        /*
         * Остальные функции администратора.
         */
        await bot.sendMessage(
            msg.chat.id,
            "🚧 Эта функция администратора пока находится в разработке."
        );

        return true;
    }

}

module.exports = new ChatRoutes();
