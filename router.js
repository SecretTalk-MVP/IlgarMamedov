const menu = require("./menu");
const aida = require("./modules/aida/aida");

const permissions = require("./modules/admin/permissions");
const statistics = require("./modules/admin/statistics");

const settings = require("./modules/settings");
const matchmaking = require("./modules/matchmaking/controller");

class Router {

    constructor() {

        /*
         * =========================================================
         * ЕДИНАЯ НАВИГАЦИЯ ВСЕГО ПРОЕКТА
         * =========================================================
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

        if (stack.length <= 1) {

            await menu.showMainMenu(
                bot,
                msg.chat.id
            );

            return true;
        }

        stack.pop();

        const previousScreen =
            stack[stack.length - 1];

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
         * /start — GLOBAL
         * =====================================================
         *
         * Никогда не передаём /start в AiDa.
         */

        if (text === "/start") {

            this.reset(userId);

            await menu.showMainMenu(
                bot,
                msg.chat.id
            );

            return true;
        }


        /*
         * =====================================================
         * GLOBAL BACK
         * =====================================================
         */

        if (text === "⬅️ Назад") {

            return await this.back(
                bot,
                msg
            );
        }


        /*
         * =====================================================
         * ADMIN ENTRY — GLOBAL
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
         * ADMIN SCREENS — GLOBAL
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
         * SETTINGS / FILTER — GLOBAL
         * =====================================================
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
            );
        }


        /*
         * =====================================================
         * ПЕРЕХОД В AIDA
         * =====================================================
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
         * AIDA ACTIVE MODE
         * =====================================================
         *
         * ВАЖНО:
         *
         * Этот блок находится ПОСЛЕ всех глобальных
         * системных маршрутов.
         *
         * Поэтому AiDa больше не перехватывает:
         *
         * /start
         * /admin
         * Admin
         * Admin-кнопки
         * Назад
         * Фильтр поиска
         *
         * Сначала Router проверяет систему.
         * Только потом получает слово AiDa.
         */

        const stack =
            this.getStack(userId);


        if (
            stack[stack.length - 1] === "aida"
        ) {

            return await aida.handle(
                bot,
                msg
            );
        }


        /*
         * =====================================================
         * SETTINGS FALLBACK
         * =====================================================
         */

        if (
            await settings.handle(
                bot,
                msg,
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
