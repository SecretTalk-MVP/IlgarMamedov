/**
 * SecretTalk
 * Admin Statistics
 * Version: 2.0
 */

class Statistics {

    async show(bot, chatId, data) {

        await bot.sendMessage(
            chatId,
`📊 Статистика

👤 Пользователей: ${data.totalUsers}
🟢 Онлайн: ${data.onlineUsers}
💬 Диалогов: ${data.dialogs}
⏳ В поиске: ${data.waitingUsers}
🤖 Общаются с AiDa: ${data.aiUsers}`
        );

    }

}

module.exports = new Statistics();
