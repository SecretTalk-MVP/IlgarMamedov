/**
 * SecretTalk
 * Admin Statistics
 * Version: 5.0
 *
 * Statistics use:
 * - PostgreSQL for persistent user data
 * - Random Chat runtime state for active chats
 *
 * Legacy matchmaking is not used.
 */

const db = require('../../database/db');
const randomchatState = require('../randomchat/state');

class Statistics {

    async show(bot, msg) {

        try {

            const result = await db.query(`
                SELECT
                    COUNT(*) AS total_users,
                    COUNT(*) FILTER (
                        WHERE last_seen >= CURRENT_TIMESTAMP - INTERVAL '5 minutes'
                    ) AS online_users
                FROM users
            `);

            const totalUsers =
                Number(result.rows[0].total_users);

            const onlineUsers =
                Number(result.rows[0].online_users);

            const waitingUsers =
                randomchatState.waiting.size;

            const activeChats =
                randomchatState.sessions.size / 2;

            await bot.sendMessage(
                msg.chat.id,
`📊 Статистика

👤 Пользователей: ${totalUsers}
🟢 Активны за 5 мин: ${onlineUsers}
💬 Активных чатов: ${activeChats}
⏳ В поиске: ${waitingUsers}`
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
