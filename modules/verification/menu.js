function showVerificationMenu(bot, msg) {
    return bot.sendMessage(
        msg.chat.id,
        "🔐 Верификация\n\n" +
        "Для общения с Никой необходимо пройти " +
        "автоматическую проверку через Telegram Video Circle.",
        {
            reply_markup: {
                keyboard: [
                    ["🔐 Пройти верификацию"],
                    ["⬅️ Назад"]
                ],
                resize_keyboard: true
            }
        }
    );
}

module.exports = {
    showVerificationMenu
};
