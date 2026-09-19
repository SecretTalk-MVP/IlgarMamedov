const db = require('../../database/db');
const permissions = require('./permissions');

class Chats {

    async showActive(bot, msg) {

        try {

            if (!permissions.canViewChats(msg.from.id)) {

                await bot.sendMessage(
                    msg.chat.id,
                    '⛔ У вас нет доступа.'
                );

                return true;
            }


            const result = await db.query(`
                SELECT
                    d.id,
                    d.user1,
                    d.user2,
                    d.started_at,
                    COUNT(m.id) AS message_count
                FROM dialogs d
                LEFT JOIN messages m
                    ON m.dialog_id = d.id
                WHERE d.active = TRUE
                GROUP BY
                    d.id,
                    d.user1,
                    d.user2,
                    d.started_at
                ORDER BY d.started_at DESC
            `);


            if (result.rows.length === 0) {

                await bot.sendMessage(
                    msg.chat.id,
                    '💬 Активные чаты\n\nСейчас активных чатов нет.'
                );

                return true;
            }


            let text =
                '💬 Активные чаты\n\n';


            result.rows.forEach((chat, index) => {

                const startedAt =
                    new Date(
                        chat.started_at
                    ).toLocaleString('ru-RU');

                text +=
`${index + 1}. 👤 ${chat.user1} ↔️ ${chat.user2}
🕐 Начат: ${startedAt}
💬 Сообщений: ${chat.message_count}

`;

            });


            await bot.sendMessage(
                msg.chat.id,
                text
            );

            return true;

        } catch (error) {

            console.error(
                'Admin Chats error:',
                error
            );

            await bot.sendMessage(
                msg.chat.id,
                '❌ Не удалось получить активные чаты.'
            );

            return true;
        }
    }
}


module.exports = new Chats();
