const db = require('../../database/db');
const permissions = require('./permissions');

class Chats {

    async showActive(bot, msg) {

        try {

            if (
                !permissions.canViewChats(
                    msg.from.id
                )
            ) {

                await bot.sendMessage(
                    msg.chat.id,
                    '⛔ У вас нет доступа.'
                );

                return true;
            }


            const result =
                await db.query(
                    `
                    SELECT
                        d.id,
                        d.user1,
                        d.user2,
                        d.dialog_type,
                        d.started_at,
                        d.ended_at,
                        d.active,

                        COUNT(m.id) AS message_count,

                        u1.username AS user1_username,
                        u1.first_name AS user1_first_name,

                        u2.username AS user2_username,
                        u2.first_name AS user2_first_name

                    FROM dialogs d

                    LEFT JOIN messages m
                        ON m.dialog_id = d.id

                    LEFT JOIN users u1
                        ON u1.telegram_id = d.user1

                    LEFT JOIN users u2
                        ON u2.telegram_id = d.user2

                    GROUP BY
                        d.id,
                        d.user1,
                        d.user2,
                        d.dialog_type,
                        d.started_at,
                        d.ended_at,
                        d.active,
                        u1.username,
                        u1.first_name,
                        u2.username,
                        u2.first_name

                    ORDER BY
                        d.active DESC,
                        d.started_at DESC
                    `
                );


            if (
                result.rows.length === 0
            ) {

                await bot.sendMessage(
                    msg.chat.id,
                    '💬 Чаты\n\nЧатов пока нет.'
                );

                return true;
            }


            let text =
                '💬 Чаты\n\n';


            const keyboard =
                result.rows.map(
                    (chat) => {

                        const startedAt =
                            new Date(
                                chat.started_at
                            ).toLocaleString(
                                'ru-RU'
                            );


                        const chatDate =
                            new Date(
                                chat.started_at
                            ).toLocaleDateString(
                                'ru-RU'
                            );


                        const status =
                            chat.active
                                ? '🟢 АКТИВЕН'
                                : '🔴 ЗАВЕРШЁН';


                        const isNika =
                            chat.dialog_type === 'nika';


                        const user1Name =
                            chat.user1_username
                                ? '@' +
                                  chat.user1_username
                                : (
                                    chat.user1_first_name ||
                                    chat.user1
                                );


                        const user2Name =
                            chat.user2_username
                                ? '@' +
                                  chat.user2_username
                                : (
                                    chat.user2_first_name ||
                                    chat.user2
                                );


                        const leftName =
                            user1Name;


                        const rightName =
                            isNika
                                ? '🤖 Ника'
                                : user2Name;


                        text +=
`${status}
👤 ${leftName} ↔️ ${rightName}
📅 Дата: ${chatDate}
🕐 Начат: ${startedAt}
💬 Сообщений: ${chat.message_count}
`;


                        if (
                            chat.ended_at
                        ) {

                            const endedAt =
                                new Date(
                                    chat.ended_at
                                ).toLocaleString(
                                    'ru-RU'
                                );


                            text +=
`🔚 Завершён: ${endedAt}
`;
                        }


                        text += '\n';


                        return [
                            {
                                text:
                                    `💬 ${
                                        isNika
                                            ? '🤖 Ника'
                                            : rightName
                                    } · ${chatDate} · ${chat.message_count} сообщ.`,

                                callback_data:
                                    `admin_chat_${chat.id}`
                            }
                        ];
                    }
                );


            await bot.sendMessage(
                msg.chat.id,
                text,
                {
                    reply_markup: {
                        inline_keyboard:
                            keyboard
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
