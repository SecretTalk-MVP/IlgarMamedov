const menu = require("./menu");
const aida = require("./modules/aida/aida");
const nika = require("./modules/nika/nika");

const verification =
    require("./modules/verification");

const verificationController =
    require("./modules/verification/controller");

const verificationMenu =
    require("./modules/verification/menu");

const permissions =
    require("./modules/admin/permissions");

const statistics =
    require("./modules/admin/statistics");

const users =
    require("./modules/admin/users");

const chats =
    require("./modules/admin/chats");

const chat =
    require("./modules/admin/chat");

const { saveUser } =
    require("./controllers/user.controller");

const profile =
    require("./modules/profile/profile");

const profileController =
    require("./modules/profile/controller");

const randomchat =
    require("./modules/randomchat/controller");

const searchFilter =
    require("./modules/searchfilter/controller");


class Router {

    constructor() {

        /*
         * =========================================================
         * ОБЩАЯ NAVIGATION
         * =========================================================
         */

        this.navigation =
            new Map();


        /*
         * =========================================================
         * ADMIN NAVIGATION
         * =========================================================
         */

        this.adminNavigation =
            new Map();
    }


    /*
     * =========================================================
     * ОБЩАЯ NAVIGATION STACK
     * =========================================================
     */

    getStack(userId) {

        if (
            !this.navigation.has(userId)
        ) {

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
     * ADMIN NAVIGATION STACK
     * =========================================================
     */

    getAdminStack(userId) {

        if (
            !this.adminNavigation.has(userId)
        ) {

            this.adminNavigation.set(
                userId,
                ["admin"]
            );
        }

        return this.adminNavigation.get(userId);
    }


    resetAdmin(userId) {

        this.adminNavigation.set(
            userId,
            ["admin"]
        );
    }


    pushAdmin(userId, screen) {

        const stack =
            this.getAdminStack(userId);

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


        /*
         * =====================================================
         * ADMIN PANEL BACK
         * =====================================================
         */

        const adminStack =
            this.adminNavigation.get(
                userId
            );


        if (
            adminStack &&
            adminStack.length > 0 &&
            adminStack.includes("admin")
        ) {

            if (
                adminStack.length === 1 &&
                adminStack[0] === "admin"
            ) {

                this.adminNavigation.delete(
                    userId
                );

                this.reset(
                    userId
                );

                await menu.showMainMenu(
                    bot,
                    msg.chat.id
                );

                return true;
            }


            adminStack.pop();


            const previousAdminScreen =
                adminStack[
                    adminStack.length - 1
                ];


            await this.showScreen(
                bot,
                msg,
                previousAdminScreen
            );

            return true;
        }


        /*
         * =====================================================
         * ОБЫЧНАЯ NAVIGATION
         * =====================================================
         */

        const stack =
            this.getStack(userId);


        if (
            stack.length <= 1
        ) {

            await menu.showMainMenu(
                bot,
                msg.chat.id
            );

            return true;
        }


        stack.pop();


        const previousScreen =
            stack[
                stack.length - 1
            ];


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
            !msg.from ||
            !msg.chat
        ) {

            return false;
        }


        await saveUser(msg);


        const userId =
            msg.from.id;


        const text =
            msg.text || "";


        /*
         * =====================================================
         * CALLBACK QUERY
         * =====================================================
         */

        if (
            msg.callback_query
        ) {

            const data =
                msg.callback_query.data || "";


            if (
                data.startsWith("admin_") &&
                !permissions.isAdmin(userId)
            ) {

                await bot.sendMessage(
                    msg.chat.id,
                    "⛔ У вас нет доступа."
                );

                return true;
            }


            /*
             * =================================================
             * USER CHAT LIST
             *
             * admin_user_chats_123
             * =================================================
             */

            if (
                data.startsWith(
                    "admin_user_chats_"
                )
            ) {

                if (
                    !permissions.canViewChatContent(
                        userId
                    )
                ) {

                    await bot.sendMessage(
                        msg.chat.id,
                        "⛔ Просмотр содержимого чатов доступен только SUPER_ADMIN."
                    );

                    return true;
                }


                const telegramId =
                    Number(
                        data.replace(
                            "admin_user_chats_",
                            ""
                        )
                    );


                if (
                    !Number.isSafeInteger(
                        telegramId
                    ) ||
                    telegramId <= 0
                ) {

                    await bot.sendMessage(
                        msg.chat.id,
                        "❌ Некорректный ID пользователя."
                    );

                    return true;
                }


                this.pushAdmin(
                    userId,
                    "user_chats"
                );


                return await users.showUserChats(
                    bot,
                    msg,
                    telegramId
                );
            }


            /*
             * =================================================
             * RETURN TO USER
             *
             * admin_user_123
             * =================================================
             */

            if (
                data.startsWith(
                    "admin_user_"
                )
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


                const telegramId =
                    Number(
                        data.replace(
                            "admin_user_",
                            ""
                        )
                    );


                if (
                    !Number.isSafeInteger(
                        telegramId
                    ) ||
                    telegramId <= 0
                ) {

                    await bot.sendMessage(
                        msg.chat.id,
                        "❌ Некорректный ID пользователя."
                    );

                    return true;
                }


                return await users.showUser(
                    bot,
                    msg,
                    telegramId
                );
            }


            /*
             * =================================================
             * RETURN TO ACTIVE CHATS
             * =================================================
             */

            if (
                data ===
                "admin_active_chats"
            ) {

                this.resetAdmin(
                    userId
                );


                this.pushAdmin(
                    userId,
                    "active_chats"
                );


                return await chats.showActive(
                    bot,
                    msg
                );
            }


            /*
             * =================================================
             * OPEN SPECIFIC CHAT
             *
             * admin_chat_123
             * =================================================
             */

            if (
                data.startsWith(
                    "admin_chat_"
                )
            ) {

                if (
                    !permissions.canViewChatContent(
                        userId
                    )
                ) {

                    await bot.sendMessage(
                        msg.chat.id,
                        "⛔ Просмотр содержимого чатов доступен только SUPER_ADMIN."
                    );

                    return true;
                }


                const dialogId =
                    Number(
                        data.replace(
                            "admin_chat_",
                            ""
                        )
                    );


                if (
                    !Number.isInteger(
                        dialogId
                    ) ||
                    dialogId <= 0
                ) {

                    await bot.sendMessage(
                        msg.chat.id,
                        "❌ Некорректный ID диалога."
                    );

                    return true;
                }


                return await chat.show(
                    bot,
                    msg,
                    dialogId
                );
            }


            return false;
        }


        /*
         * =====================================================
         * GLOBAL /start
         * =====================================================
         */

        if (
            text === "/start"
        ) {

            this.reset(
                userId
            );

            this.adminNavigation.delete(
                userId
            );


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


            this.reset(
                userId
            );

            this.resetAdmin(
                userId
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

            const adminStack =
                this.getAdminStack(
                    userId
                );


            if (
                !adminStack.includes(
                    "admin"
                )
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


            this.pushAdmin(
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

        const adminStackForUsers =
            this.adminNavigation.get(
                userId
            );


        if (
            adminStackForUsers &&
            adminStackForUsers.includes(
                "admin"
            ) &&
            adminStackForUsers[
                adminStackForUsers.length - 1
            ] === "users"
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
            text ===
            "🎲 Случайного собеседника"
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
            text ===
            "🤖 Выбрать персонажа"
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
         * VERIFICATION ENTRY
         * ===================================================== */

        if (
            text ===
            "🔐 Пройти верификацию"
        ) {

            return await verificationController.startVerification(
                bot,
                msg
            );
        }


        /*
         * =====================================================
         * NIKA ENTRY
         * =====================================================
         */

if (
    text === "Ника"
) {

    const isBlocked =
        await profile.isBlocked(
            userId
        );


    if (
        isBlocked
    ) {

        await bot.sendMessage(
            msg.chat.id,
            "Извините, Ника не желает общаться с вами."
        );

        return true;
    }


    const hasProfile =
        await profile.hasRequiredProfile(
            userId
        );


    if (
        !hasProfile
    ) {

        this.push(
            userId,
            "profile_gender"
        );


        await profileController.showGenderSelection(
            bot,
            msg
        );

        return true;
    }


    const gender =
        await profile.getGender(
            userId
        );


    if (
        gender !== "woman"
    ) {

        await bot.sendMessage(
            msg.chat.id,
            "Извините, Ника не желает общаться с вами."
        );

        return true;
    }


    const isAdmin =
        permissions.isAdmin(
            userId
        );


    const isVerified =
        await verification.isVerified(
            userId
        );


    if (
        !isAdmin &&
        !isVerified
    ) {

        this.push(
            userId,
            "verification"
        );


        await verificationMenu.showVerificationMenu(
            bot,
            msg
        );

        return true;
    }


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

            const isAdmin =
                permissions.isAdmin(
                    userId
                );


            const isVerified =
                await verification.isVerified(
                    userId
                );


            if (
                !isAdmin &&
                !isVerified
            ) {

                this.push(
                    userId,
                    "verification"
                );


                await verificationMenu.showVerificationMenu(
                    bot,
                    msg
                );

                return true;
            }


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
         */

        if (
            text ===
            "🤖 Поговорить с ИИ"
        ) {

            const partnerId =
                randomchat.leave(
                    msg.chat.id
                );


            if (
                partnerId
            ) {

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
            this.getStack(
                userId
            );


        /*
         * =====================================================
         * VERIFICATION VIDEO NOTE
         * =====================================================
         */

        if (
            msg.video_note
        ) {

            const handled =
                await verificationController.handleVideoNote(
                    bot,
                    msg
                );


            if (
                handled
            ) {

                return true;
            }
        }


        /*
         * =====================================================
         * PROFILE GENDER ACTIVE MODE
         * =====================================================
         */

        if (
            stack[
                stack.length - 1
            ] === "profile_gender"
        ) {

            const handled =
                await profileController.handleGenderSelection(
                    bot,
                    msg
                );


            if (
                handled
            ) {

                stack.pop();


                this.push(
                    userId,
                    "verification"
                );


                await verificationMenu.showVerificationMenu(
                    bot,
                    msg
                );

                return true;
            }
        }


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
            stack[
                stack.length - 1
            ] === "nika"
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
         */

        if (
            stack[
                stack.length - 1
            ] === "aida"
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
            stack[
                stack.length - 1
            ] === "search_filter"
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
