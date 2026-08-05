/**
 * SecretTalk
 * Admin Menu
 * Version: 1.0
 */

async function show(bot, chatId) {

    await bot.sendMessage(
        chatId,
        "⚙️ Панель администратора",
        {
            reply_markup: {
                keyboard: [
    ['📊 Статистика', '👥 Пользователи'],
    ['💬 Активные чаты', '📢 Рассылка'],
    ['🚫 Бан / Разбан', '⚙️ Настройки'],
    ['⬅️ Назад']
],
                resize_keyboard: true
            }
        }
    );

}

module.exports = {
    show
};
