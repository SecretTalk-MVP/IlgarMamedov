const admin = require('./modules/admin/permissions');

function createMainMenu(userId) {

    const keyboard = [
        ['🤖 Поговорить с ИИ', '👥 Найти собеседника'],
        ['⚙️ Фильтр поиска']
    ];

    if (admin.isAdmin(userId)) {
        keyboard[1].push('👑 Админ');
    }

    return {
        keyboard,
        resize_keyboard: true
    };
}

async function showMainMenu(bot, userId) {

    await bot.sendMessage(
        userId,
        'Добро пожаловать в SecretTalk 💌\n\nВыберите действие:',
        {
            reply_markup: createMainMenu(userId)
        }
    );
}

module.exports = {
    createMainMenu,
    showMainMenu
};
