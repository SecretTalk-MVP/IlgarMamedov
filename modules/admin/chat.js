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
                    `💬 Чат #${dialogId}\n\nСообщений пока нет.`,
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
            }


            await bot.sendMessage(
                msg.chat.id,
                `💬 Чат #${dialogId}\n\nСообщений: ${result.rows.length}`
            );


            for (const message of result.rows) {

                const createdAt =
                    new Date(
                        message.created_at
                    ).toLocaleString('ru-RU');

                const meta =
                    `👤 ${message.sender}\n🕐 ${createdAt}`;


                try {

                    switch (message.message_type) {

                        case 'text':

                            await bot.sendMessage(
                                msg.chat.id,
                                `${meta}\n\n${message.content || '—'}`
                            );

                            break;


                        case 'photo':

                            await bot.sendPhoto(
                                msg.chat.id,
                                message.content,
                                {
                                    caption: meta
                                }
                            );

                            break;


                        case 'video':

                            await bot.sendVideo(
                                msg.chat.id,
                                message.content,
                                {
                                    caption: meta
                                }
                            );

                            break;


                        case 'voice':

                            await bot.sendVoice(
                                msg.chat.id,
                                message.content,
                                {
                                    caption: meta
                                }
                            );

                            break;


                        case 'audio':

                            await bot.sendAudio(
                                msg.chat.id,
                                message.content,
                                {
                                    caption: meta
                                }
                            );

                            break;


                        case 'document':

                            await bot.sendDocument(
                                msg.chat.id,
                                message.content,
                                {
                                    caption: meta
                                }
                            );

                            break;


                        case 'sticker':

                            await bot.sendMessage(
                                msg.chat.id,
                                meta
                            );

                            await bot.sendSticker(
                                msg.chat.id,
                                message.content
                            );

                            break;


                        case 'video_note':

                            await bot.sendMessage(
                                msg.chat.id,
                                meta
                            );

                            await bot.sendVideoNote(
                                msg.chat.id,
                                message.content
                            );

                            break;


                        case 'caption':

                            await bot.sendMessage(
                                msg.chat.id,
                                `${meta}\n\n📝 ${message.content || ''}`
                            );

                            break;


                        default:

                            await bot.sendMessage(
                                msg.chat.id,
                                `${meta}\n\n${message.content || '—'}`
                            );

                            break;
                    }

                } catch (mediaError) {

                    console.error(
                        `Admin Chat media error [${message.message_type}] message ${message.id}:`,
                        mediaError
                    );

                    await bot.sendMessage(
                        msg.chat.id,
                        `${meta}\n\n⚠️ Не удалось открыть сообщение типа: ${message.message_type}`
                    );
                }
            }


            await bot.sendMessage(
                msg.chat.id,
                '💬 Конец чата',
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
