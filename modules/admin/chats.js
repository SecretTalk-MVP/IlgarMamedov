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
                    d.ended_at,
                    d.active,
                    COUNT(m.id) AS message_count
                FROM dialogs d
                LEFT JOIN messages m
                    ON m.dialog_id = d.id
                GROUP BY
                    d.id,
                    d.user1,
                    d.user2,
                    d.started_at,
                    d.ended_at,
                    d.active
                ORDER BY
                    d.active DESC,
                    d.started_at DESC
            `);


            if (result.rows.length === 0) {

                await bot.sendMessage(
                    msg.chat.id,
                    '💬 Чаты\n\nЧатов пока нет.'
                );

                return true;
            }


            let text =
                '💬 Чаты\n\n';


            const keyboard =
                result.rows.map((chat) => {

                    const startedAt =
                        new Date(
                            chat.started_at
                        ).toLocaleString('ru-RU');


                    const status =
                        chat.active
                            ? '🟢 АКТИВЕН'
                            : '🔴 ЗАВЕРШЁН';


                    text +=
`${status}
${chat.user1} ↔️ ${chat.user2}
🕐 Начат: ${startedAt}
💬 Сообщений: ${chat.message_count}
`;


                    if (chat.ended_at) {

                        const endedAt =
                            new Date(
                                chat.ended_at
                            ).toLocaleString('ru-RU');

                        text +=
`🔚 Завершён: ${endedAt}
`;
                    }


                    text += '\n';


                    return [
                        {
                            text:
                                `💬 ${chat.user1} ↔️ ${chat.user2} — ${chat.message_count} сообщ.`,
                            callback_data:
                                `admin_chat_${chat.id}`
                        }
                    ];
                });


            await bot.sendMessage(
                msg.chat.id,
                text,
                {
                    reply_markup: {
                        inline_keyboard: keyboard
                    }
                }
            );


            return true;

        } catch (error) {

            console.error(
                'Admin Chats error:',
                error
            );

            await bot.sendMessage(
                msg.chat.id,
                '❌ Не удалось получить чаты.'
            );

            return true;
        }
    }
}


module.exports = new Chats();
