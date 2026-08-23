const menu = require("./menu");
const aida = require("./modules/aida/aida");
const nika = require("./modules/nika/nika");

const permissions = require("./modules/admin/permissions");
const statistics = require("./modules/admin/statistics");

const settings = require("./modules/settings");
const matchmaking = require("./modules/matchmaking/controller");

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

                await this.showAdminMenu(
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

        if (
            !msg ||
            !msg.text ||
            !msg.from
        ) {

            return false;
        }


        const userId =
            msg.from.id;

        const text =
            msg.text;


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

            return await matchmaking.handle(
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
             * Администратор имеет временный
             * bypass верификации.
             *
             * Для остальных пользователей
             * verification будет подключена
             * отдельным модулем.
             */

            if (
                !permissions.isAdmin(
                    userId
                )
            ) {

                await bot.sendMessage(
                    msg.chat.id,
                    "🔐 Для общения с Никой сначала необходимо пройти верификацию."
                );

                return true;
            }
            this.push(
    userId,
    "nika"
);


            return await nika.handle(
                bot,
                msg
            );
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
         * NIKA ACTIVE MODE
         * =====================================================
         *
         * Только после глобальных команд.
         */

        const stack =
            this.getStack(userId);


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
         * SETTINGS / FILTER
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
                msg
            )
        ) {

            return true;
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
