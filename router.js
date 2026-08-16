const menu = require("./menu");
const permissions = require("./modules/admin/permissions");
const statistics = require("./modules/admin/statistics");

class Router {

    constructor() {
        /*
         * Единое состояние навигации всего проекта.
         *
         * userId -> массив экранов
         *
         * Например:
         * ["main", "admin", "active_chats"]
         */
        this.navigation = new Map();
    }

    /*
     * =========================================================
     * NAVIGATION
     * =========================================================
     */

    getStack(userId) {

        if (!this.navigation.has(userId)) {
            this.navigation.set(userId, ["main"]);
        }

        return this.navigation.get(userId);
    }


    reset(userId) {

        this.navigation.set(userId, ["main"]);
    }


    push(userId, screen) {

        const stack = this.getStack(userId);

        /*
         * Не добавляем один и тот же экран
         * два раза подряд.
         */
        if (stack[stack.length - 1] !== screen) {
            stack.push(screen);
        }
    }


    async back(bot, msg) {

        const userId = msg.from.id;
        const stack = this.getStack(userId);

        /*
         * Главное меню — самая верхняя точка.
         * Назад из него никуда не уходит.
         */
        if (stack.length <= 1) {

            await menu.showMainMenu(
                bot,
                msg.chat.id
            );

            return true;
        }

        /*
         * Убираем текущий экран.
         */
        stack.pop();

        /*
         * Получаем предыдущий экран.
         */
        const previousScreen =
            stack[stack.length - 1];

        /*
         * Показываем предыдущий экран.
         */
        await this.showScreen(
            bot,
            msg,
            previousScreen
        );

        return true;
    }


    /*
     * =========================================================
     * SCREEN RENDERER
     * =========================================================
     *
     * Router является единственным местом,
     * которое управляет навигацией между экранами.
     */

    async showScreen(bot, msg, screen) {

        switch (screen) {

            case "main":

                await menu.showMainMenu(
                    bot,
                    msg.chat.id
                );

                return;


            case "admin":

                await this.showAdminMenu(
                    bot,
                    msg.chat.id
                );

                return;


            case "statistics":

                await statistics.show(
                    bot,
                    msg,
                    null
                );

                return;


            case "active_chats":

                await bot.sendMessage(
                    msg.chat.id,
                    "💬 Активные чаты\n\n🚧 Эта функция администратора пока находится в разработке."
                );

                return;


            case "users":

                await bot.sendMessage(
                    msg.chat.id,
                    "👥 Пользователи\n\n🚧 Эта функция администратора пока находится в разработке."
                );

                return;


            case "broadcast":

                await bot.sendMessage(
                    msg.chat.id,
                    "📢 Рассылка\n\n🚧 Эта функция администратора пока находится в разработке."
                );

                return;


            case "ban":

                await bot.sendMessage(
                    msg.chat.id,
                    "🚫 Бан / Разбан\n\n🚧 Эта функция администратора пока находится в разработке."
                );

                return;


            case "settings":

                await bot.sendMessage(
                    msg.chat.id,
                    "⚙️ Настройки\n\n🚧 Эта функция администратора пока находится в разработке."
                );

                return;


            default:

                await menu.showMainMenu(
                    bot,
                    msg.chat.id
                );

                return;
        }
    }


    /*
     * =========================================================
     * ADMIN MENU
     * =========================================================
     *
     * Это НЕ отдельный Router.
     * Это экран, которым управляет общий Router.
     */

    async showAdminMenu(bot, chatId) {

        await bot.sendMessage(
            chatId,
            "Добро пожаловать в SecretTalk ❤️\n\nПанель администратора:",
            {
                reply_markup: {
                    keyboard: [
                        ["📊 Статистика", "👥 Пользователи"],
                        ["💬 Активные чаты", "📢 Рассылка"],
                        ["🚫 Бан / Разбан", "⚙️ Настройки"],
                        ["⬅️ Назад"]
                    ],
                    resize_keyboard: true
                }
            }
        );
    }


    /*
     * =========================================================
     * MAIN ROUTER
     * =========================================================
     */

    async handle(bot, msg, aiUsers) {

        if (!msg || !msg.text || !msg.from) {
            return false;
        }

        const userId = msg.from.id;
        const text = msg.text;


        /*
         * =====================================================
         * ГЛОБАЛЬНАЯ КНОПКА НАЗАД
         * =====================================================
         *
         * Она НЕ принадлежит Admin.
         * Она принадлежит всей системе навигации.
         */

        if (text === "⬅️ Назад") {

            return await this.back(
                bot,
                msg
            );
        }


        /*
         * =====================================================
         * ADMIN ENTRY
         * =====================================================
         */

        if (
            text === "/admin" ||
            text === "Админ" ||
            text === "Admin" ||
            text === "👑 Админ" ||
            text === "👑 Admin"
        ) {

            if (!permissions.isAdmin(userId)) {

                await bot.sendMessage(
                    msg.chat.id,
                    "⛔ У вас нет доступа."
                );

                return true;
            }

            this.reset(userId);

            this.push(
                userId,
                "admin"
            );

            await this.showAdminMenu(
                bot,
                msg.chat.id
            );

            return true;
        }


        /*
         * =====================================================
         * ADMIN SCREENS
         * =====================================================
         */

        const adminScreens = {
            "📊 Статистика": "statistics",
            "👥 Пользователи": "users",
            "💬 Активные чаты": "active_chats",
            "📢 Рассылка": "broadcast",
            "🚫 Бан / Разбан": "ban",
            "⚙️ Настройки": "settings"
        };


        if (adminScreens[text]) {

            /*
             * Если пользователь не находится
             * внутри Admin — эти кнопки не обрабатываем.
             */
            const stack = this.getStack(userId);

            if (!stack.includes("admin")) {
                return false;
            }

            if (!permissions.isAdmin(userId)) {

                await bot.sendMessage(
                    msg.chat.id,
                    "⛔ У вас нет доступа."
                );

                return true;
            }

            const screen = adminScreens[text];

            this.push(
                userId,
                screen
            );

            await this.showScreen(
                bot,
                msg,
                screen
            );

            return true;
        }


        /*
         * =====================================================
         * НЕ НАШЛИ МАРШРУТ
         * =====================================================
         *
         * Другие модули будут подключаться сюда постепенно.
         */

        return false;
    }
}

module.exports = new Router();
