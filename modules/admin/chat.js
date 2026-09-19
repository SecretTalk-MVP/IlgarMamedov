const db = require('../../database/db');
const permissions = require('./permissions');

class Chat {

    async show(bot, msg, dialogId) {

        try {

            if (!permissions.canViewChatContent(msg.from.id)) {

                await bot.sendMessage(
                    msg.chat.id,
                    '⛔ Просмотр содержимого чатов доступен только SUPER_ADMIN.'
                );

                return true;
            }


            if (!dialogId) {

                await bot.sendMessage(
                    msg.chat.id,
                    '❌ Диалог не указан.'
                );

                return true;
            }


            const result = await db.query(
                `
                SELECT
                    m.id,
                    m.sender,
                    m.message_type,
                    m.content,
                    m.created_at
                FROM messages m
                WHERE m.dialog_id = $1
                ORDER BY m.created_at ASC, m.id ASC
                `,
                [dialogId]
            );


            if (result.rows.length === 0) {

                await bot.sendMessage(
                    msg.chat.id,
                    `💬 Чат #${dialogId}\n\nСообщений пока нет.`
                );

                return true;
            }


            let text =
                `💬 Чат #${dialogId}\n\n`;


            result.rows.forEach((message) => {

                const createdAt =
                    new Date(
                        message.created_at
                    ).toLocaleString('ru-RU');

                let content;


                switch (message.message_type) {

                    case 'photo':
                        content = '📷 Фото';
                        break;

                    case 'video':
                        content = '🎥 Видео';
                        break;

                    case 'voice':
                        content = '🎤 Голосовое';
                        break;

                    case 'audio':
                        content = '🎵 Аудио';
                        break;

                    case 'document':
                        content = '📄 Документ';
                        break;

                    case 'sticker':
                        content = '🎭 Стикер';
                        break;

                    case 'video_note':
                        content = '⭕ Видеосообщение';
                        break;

                    case 'caption':
                        content = `📝 ${message.content || ''}`;
                        break;

                    default:
                        content =
                            message.content || '—';
                }


                text +=
`${message.sender}
${content}
🕐 ${createdAt}

`;

            });


            await bot.sendMessage(
                msg.chat.id,
                text,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: '⬅️ К активным чатам',
                                    callback_data: 'admin_active_chats'
                                }
                            ]
                        ]
                    }
                }
            );


            return true;

        } catch (error) {

            console.error(
                'Admin Chat error:',
                error
            );

            await bot.sendMessage(
                msg.chat.id,
                '❌ Не удалось открыть чат.'
            );

            return true;
        }
    }
}


module.exports = new Chat();
