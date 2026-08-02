/**
 * SecretTalk
 * Admin Statistics
 * Version: 3.0
 */

class Statistics {

    async show(bot, msg, users, onlineUsers, dialogs, waitingUsers, aiUsers) {

        const totalUsers = Object.keys(users).length;
        const online = onlineUsers.size;
        const dialogsCount = Object.keys(dialogs).length / 2;
        const waiting = waitingUsers.length;
        const aiCount = Object.keys(aiUsers).length;

        await bot.sendMessage(
            msg.chat.id,
`📊 Статистика

👤 Пользователей: ${totalUsers}
🟢 Онлайн: ${online}
💬 Диалогов: ${dialogsCount}
⏳ В поиске: ${waiting}
🤖 Общаются с AiDa: ${aiCount}`
        );

    }

}

module.exports = new Statistics();
