const menu = require("./menu");
const aida = require("./modules/aida/aida");
const nika = require("./modules/nika/nika");

const permissions = require("./modules/admin/permissions");
const statistics = require("./modules/admin/statistics");
const users = require("./modules/admin/users");
const chats = require("./modules/admin/chats");
const chat = require("./modules/admin/chat");

const randomchat = require("./modules/randomchat/controller");
const searchFilter = require("./modules/searchfilter/controller");

class Router {

    constructor() {

        /*
         * =========================================================
         * ЕДИНАЯ НАВИГАЦИЯ
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

        const stack =
            this.getStack(userId);

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

        const userId =
            msg.from.id;

        const stack =
            this.getStack(userId);


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

                await menu.showAdminMenu(
                    bot,
                    msg.chat.id
                );

                return;


            case "statistics":

                await statistics.show(
                    bot,
                    msg
                );

                return;


            case "active_chats":

    await chats.showActive(
        bot,
        msg
    );

    return;


            case "users":

                await users.showSearch(
                    bot,
                    msg
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


            case "find_partner":

                await this.showFindPartnerMenu(
                    bot,
                    msg
                );

                return;


            case "characters":

                await this.showCharactersMenu(
                    bot,
                    msg
                );

                return;


            case "search_filter":

                await searchFilter.show(
                    bot,
                    msg
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
     * FIND PARTNER MENU
     * =========================================================
     */

    async showFindPartnerMenu(
        bot,
        msg
    ) {

        await bot.sendMessage(
            msg.chat.id,
            "Кого вы хотите найти?",
            {
                reply_markup: {
                    keyboard: [
                        ["🎲 Случайного собеседника"],
                        ["🤖 Выбрать персонажа"],
                        ["⬅️ Назад"]
                    ],
                    resize_keyboard: true
                }
            }
        );
    }


    /*
     * =========================================================
     * CHARACTER MENU
     * =========================================================
     *
     * AiDa здесь намеренно отсутствует.
     *
     * AiDa остаётся на главном пользовательском меню.
     */

    async showCharactersMenu(
        bot,
        msg
    ) {

        await bot.sendMessage(
            msg.chat.id,
            "Выберите персонажа",
            {
                reply_markup: {
                    keyboard: [
                        ["Ника"],
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

        if (!msg || !msg.from || !msg.chat) {
            return false;
        }


        const userId =
            msg.from.id;

        const text =
            msg.text || "";


        /*
         * =====================================================
         * GLOBAL /start
         * =====================================================
         */

        if (
            text === "/start"
        ) {

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

        if (
            text === "⬅️ Назад"
        ) {

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


            await menu.showAdminMenu(
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
         * ADMIN USER SEARCH
         * =====================================================
         */

        const stackForUsers =
            this.getStack(userId);

        if (
            stackForUsers.includes("admin") &&
            stackForUsers[stackForUsers.length - 1] === "users"
        ) {

            if (
                !permissions.canViewUsers(
                    userId
                )
            ) {

                await bot.sendMessage(
                    msg.chat.id,
                    "⛔ У вас нет доступа."
                );

                return true;
            }

            return await users.showUser(
                bot,
                msg,
                text
            );
        }


        /*
         * =====================================================
         * SEARCH FILTER ENTRY
         * =====================================================
         */

        if (
            text === "⚙️ Фильтр поиска"
        ) {

            this.push(
                userId,
                "search_filter"
            );

            return await searchFilter.show(
                bot,
                msg
            );
        }


        /*
         * =====================================================
         * FIND PARTNER
         * =====================================================
         */

        if (
            text === "👥 Найти собеседника"
        ) {

            this.push(
                userId,
                "find_partner"
            );


            await this.showFindPartnerMenu(
                bot,
                msg
            );

            return true;
        }


        /*
         * =====================================================
         * RANDOM PARTNER
         * =====================================================
         */

        if (
            text === "🎲 Случайного собеседника"
        ) {

            return await randomchat.findRandom(
                bot,
                msg
            );
        }


        /*
         * =====================================================
         * CHARACTER SELECTION
         * =====================================================
         */

        if (
            text === "🤖 Выбрать персонажа"
        ) {

            this.push(
                userId,
                "characters"
            );


            await this.showCharactersMenu(
                bot,
                msg
            );

            return true;
        }


        /*
         * =====================================================
         * NIKA ENTRY
         * =====================================================
         */

        if (
            text === "Ника"
        ) {

            /*
             * Для обычных пользователей
             * здесь позже будет запуск verification.
             *
             * Администратор имеет временный bypass.
             */

            const verification =
                require("./modules/verification");

            const isAdmin =
                permissions.isAdmin(userId);

            const isVerified =
                await verification.isVerified(userId);

            if (
                !isAdmin &&
                !isVerified
            ) {

                await bot.sendMessage(
                    msg.chat.id,
                    "🔐 Для общения с Никой сначала необходимо пройти верификацию."
                );

                return true;
            }


            /*
             * Входим в режим Nika.
             *
             * ВАЖНО:
             * слово "Ника" является выбором персонажа,
             * а НЕ сообщением для AI.
             */

            this.push(
                userId,
                "nika"
            );

            await bot.sendMessage(
                msg.chat.id,
                "Привет. Я Ника. Теперь можем поговорить."
            );

            return true;
        }


        /*
         * =====================================================
         * AIDA ENTRY
         * =====================================================
         *
         * AiDa остаётся отдельным пунктом
         * главного меню.
         */

        if (
            text === "🤖 Поговорить с ИИ"
        ) {

            const partnerId =
                randomchat.leave(
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
         * ACTIVE ROUTING
         * =====================================================
         */

        const stack =
            this.getStack(userId);


        /*
         * =====================================================
         * RANDOM CHAT ACTIVE MODE
         * =====================================================
         */

        if (
            await randomchat.handle(
                bot,
                msg
            )
        ) {

            return true;
        }


        /*
         * =====================================================
         * NIKA ACTIVE MODE
         * =====================================================
         */

        if (
            stack[stack.length - 1] === "nika"
        ) {

            return await nika.handle(
                bot,
                msg
            );
        }


        /*
         * =====================================================
         * AIDA ACTIVE MODE
         * =====================================================
         *
         * AiDa никогда не получает сообщение
         * раньше системных маршрутов.
         */

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
         * SEARCH FILTER ACTIVE MODE
         * =====================================================
         */

        if (
            stack[stack.length - 1] === "search_filter"
        ) {

            return await searchFilter.handle(
                bot,
                msg
            );
        }


        /*
         * =====================================================
         * NOTHING FOUND
         * =====================================================
         */

        return false;
    }
}


module.exports = new Router();
