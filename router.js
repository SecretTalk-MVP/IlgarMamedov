const menu = require("./menu");

const permissions = require("./modules/admin/permissions");
const statistics = require("./modules/admin/statistics");

const aida = require("./modules/aida");
const settings = require("./modules/settings");
const matchmaking = require("./modules/matchmaking/routes");


class Router {

    constructor() {

        /*
         * =========================================================
         * ЕДИНАЯ НАВИГАЦИЯ ВСЕГО ПРОЕКТА
         * =========================================================
         *
         * userId -> ["main", "admin", "statistics"]
         *
         * Каждый пользователь имеет собственный стек экранов.
         */

        this.navigation = new Map();
    }


    /*
     * =========================================================
     * NAVIGATION STACK
     * =========================================================
     */

    getStack(userId) {

        if (!this.navigation.has(userId)) {

            this.navigation.set(
                userId,
                ["main"]
            );
        }

        return this.navigation.get(userId);
    }


    reset(userId) {

        this.navigation.set(
            userId,
            ["main"]
        );
    }


    push(userId, screen) {

        const stack = this.getStack(userId);

        if (
            stack[stack.length - 1] !== screen
        ) {

            stack.push(screen);
        }
    }


    /*
     * =========================================================
     * GLOBAL BACK
     * =========================================================
     */

    async back(bot, msg) {

        const userId = msg.from.id;

        const stack = this.getStack(userId);


        /*
         * Уже в главном меню.
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
     */

    async showScreen(
        bot,
        msg,
        screen
    ) {

        switch (screen) {


            /*
             * =================================================
             * MAIN
             * =================================================
             */

            case "main":

                await menu.showMainMenu(
                    bot,
                    msg.chat.id
                );

                return;


            /*
             * =================================================
             * ADMIN
             * =================================================
             */

            case "admin":

                await this.showAdminMenu(
                    bot,
                    msg.chat.id
                );

                return;


            /*
             * =================================================
             * STATISTICS
             * =================================================
             */

            case "statistics":

                await statistics.show(
                    bot,
                    msg,
                    aida.users
                );

                return;


            /*
             * =================================================
             * ACTIVE CHATS
             * =================================================
             */

            case "active_chats":

                await bot.sendMessage(
                    msg.chat.id,
                    "💬 Активные чаты\n\n🚧 Эта функция администратора пока находится в разработке."
                );

                return;


            /*
             * =================================================
             * USERS
             * =================================================
             */

            case "users":

                await bot.sendMessage(
                    msg.chat.id,
                    "👥 Пользователи\n\n🚧 Эта функция администратора пока находится в разработке."
                );

                return;


            /*
             * =================================================
             * BROADCAST
             * =================================================
             */

            case "broadcast":

                await bot.sendMessage(
                    msg.chat.id,
                    "📢 Рассылка\n\n🚧 Эта функция администратора пока находится в разработке."
                );

                return;


            /*
             * =================================================
             * BAN
             * =================================================
             */

            case "ban":

                await bot.sendMessage(
                    msg.chat.id,
                    "🚫 Бан / Разбан\n\n🚧 Эта функция администратора пока находится в разработке."
                );

                return;


            /*
             * =================================================
             * SETTINGS
             * =================================================
             */

            case "settings":

                await bot.sendMessage(
                    msg.chat.id,
                    "⚙️ Настройки\n\n🚧 Эта функция администратора пока находится в разработке."
                );

                return;


            /*
             * =================================================
             * DEFAULT
             * =================================================
             */

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
     * Главное Admin-меню теперь находится здесь,
     * в едином Router.
     */

    async showAdminMenu(
        bot,
        chatId
    ) {

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

    async handle(
        bot,
        msg,
        aiUsers
    ) {

        if (
            !msg ||
            !msg.text ||
            !msg.from
        ) {

            return false;
        }


        const userId = msg.from.id;
        const text = msg.text;


        /*
         * =====================================================
         * GLOBAL BACK
         * =====================================================
         *
         * Назад принадлежит всей системе,
         * а не Admin / AiDa / Settings.
         */

        if (text === "⬅️ Назад") {

            return await this.back(
                bot,
                msg
            );
        }


        /*
         * =====================================================
         * ПЕРЕХОД В AIDA
         * =====================================================
         *
         * Перенесено из старого modules/router/index.js.
         */

        if (
            text === "🤖 Поговорить с ИИ"
        ) {

            const partnerId =
                matchmaking.leaveForAi(
                    msg.chat.id
                );


            if (partnerId) {

                await bot.sendMessage(
                    partnerId,
                    "❌ Собеседник перешёл в режим ИИ."
                );
            }


            this.push(
                userId,
                "aida"
            );


            return await aida.handle(
                bot,
                msg
            );
        }


        /*
         * =====================================================
         * AIDA
         * =====================================================
         *
         * Сообщения пользователя в режиме AiDa
         * передаются существующему модулю.
         */

        if (
            await aida.handle(
                bot,
                msg
            )
        ) {

            return true;
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

            if (
                !permissions.isAdmin(
                    userId
                )
            ) {

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

            "📊 Статистика":
                "statistics",

            "👥 Пользователи":
                "users",

            "💬 Активные чаты":
                "active_chats",

            "📢 Рассылка":
                "broadcast",

            "🚫 Бан / Разбан":
                "ban",

            "⚙️ Настройки":
                "settings"
        };


        if (
            adminScreens[text]
        ) {

            const stack =
                this.getStack(userId);


            /*
             * Admin-кнопки работают
             * только внутри Admin.
             */

            if (
                !stack.includes("admin")
            ) {

                return false;
            }


            if (
                !permissions.isAdmin(
                    userId
                )
            ) {

                await bot.sendMessage(
                    msg.chat.id,
                    "⛔ У вас нет доступа."
                );

                return true;
            }


            const screen =
                adminScreens[text];


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
         * SETTINGS / FILTER
         * =====================================================
         *
         * Переносим старую маршрутизацию Settings
         * в единый Router.
         */

        if (
            text === "⚙️ Фильтр поиска"
        ) {

            this.push(
                userId,
                "settings"
            );


            return await settings.handle(
                bot,
                msg,
                aida.users
            );
        }


        /*
         * Остальные сообщения пока передаём дальше
         * существующей архитектуре через Router.
         */

        if (
            await settings.handle(
                bot,
                msg,
                aida.users
            )
        ) {

            return true;
        }


        /*
         * =====================================================
         * НИЧЕГО НЕ НАЙДЕНО
         * =====================================================
         */

        return false;
    }
}


module.exports = new Router();
