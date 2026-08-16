const admin = require("./modules/admin/permissions");

function createMainMenu(userId) {

    const keyboard = [
        ["🤖 Поговорить с ИИ", "👥 Найти собеседника"],
        ["⚙️ Фильтр поиска"]
    ];

    if (admin.isAdmin(userId)) {
        keyboard[1].push("👑 Админ");
    }

    return {
        keyboard,
        resize_keyboard: true
    };
}

async function showMainMenu(bot, userId) {

    await bot.sendMessage(
        userId,
        "Добро пожаловать в SecretTalk 💌\n\nВыберите действие:",
        {
            reply_markup: createMainMenu(userId)
        }
    );
}

/*
 * =========================================================
 * ЕДИНЫЙ MENU.JS
 * Панель администратора также создаётся здесь.
 * Отдельного modules/admin/menu.js больше не будет.
 * =========================================================
 */

function createAdminMenu() {

    const keyboard = [
        ["📊 Статистика", "👥 Пользователи"],
        ["💬 Активные чаты", "📢 Рассылка"],
        ["🚫 Бан / Разбан", "⚙️ Настройки"],
        ["⬅️ Назад"]
    ];

    return {
        keyboard,
        resize_keyboard: true
    };
}

async function showAdminMenu(bot, userId) {

    await bot.sendMessage(
        userId,
        "Добро пожаловать в SecretTalk ❤️\n\nПанель администратора:",
        {
            reply_markup: createAdminMenu()
        }
    );
}

module.exports = {
    createMainMenu,
    showMainMenu,
    createAdminMenu,
    showAdminMenu
};
