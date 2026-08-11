/**
 * SecretTalk
 * Admin Statistics
 * Version: 4.0
 */

const db = require('../../database/db');
const matchmakingState = require('../matchmaking/state');

class Statistics {

    async show(bot, msg, aiUsers) {

        try {

            const result = await db.query(
                'SELECT COUNT(*) AS count FROM users'
            );

            const totalUsers = Number(result.rows[0].count);

            const online = 0;

            const dialogsCount =
                Object.keys(matchmakingState.dialogs).length / 2;

            const waiting =
                matchmakingState.waitingUsers.length;

            const aiCount =
                Object.keys(aiUsers || {}).length;

            await bot.sendMessage(
                msg.chat.id,
`📊 Статистика

👤 Пользователей: ${totalUsers}
🟢 Онлайн: ${online}
💬 Диалогов: ${dialogsCount}
⏳ В поиске: ${waiting}
🤖 Общаются с AiDa: ${aiCount}`
            );

            return true;

        } catch (error) {

            console.error(
                'Admin Statistics error:',
                error
            );

            await bot.sendMessage(
                msg.chat.id,
                '❌ Не удалось получить статистику.'
            );

            return true;
        }
    }

}

module.exports = new Statistics();
