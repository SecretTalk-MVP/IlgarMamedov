const db = require('../../database/db');
const permissions = require('./permissions');
const randomchatState = require('../randomchat/state');
const randomchatSession = require('../randomchat/session');

class Users {

    async showSearch(bot, msg) {

        await bot.sendMessage(
            msg.chat.id,
            '👥 Пользователи\n\nВведите Telegram ID пользователя:'
        );

        return true;
    }


    async showUser(bot, msg, telegramId) {

        try {

            const id = Number(telegramId);

            if (!Number.isSafeInteger(id) || id <= 0) {

                await bot.sendMessage(
                    msg.chat.id,
                    '❌ Некорректный Telegram ID.'
                );

                return true;
            }


            const result = await db.query(
                `
                SELECT
                    telegram_id,
                    username,
                    first_name,
                    gender,
                    age,
                    city,
                    goal,
                    verified,
                    premium,
                    role,
                    created_at,
                    last_seen,

                    (
                        SELECT COUNT(*)
                        FROM messages m
                        INNER JOIN dialogs d
                            ON d.id = m.dialog_id
                        WHERE
                            d.user1 = users.telegram_id
                            OR d.user2 = users.telegram_id
                    ) AS message_count,

                    (
                        SELECT COUNT(*)
                        FROM dialogs d
                        WHERE
                            d.user1 = users.telegram_id
                            OR d.user2 = users.telegram_id
                    ) AS chat_count

                FROM users
                WHERE telegram_id = $1
                LIMIT 1
                `,
                [id]
            );


            if (result.rows.length === 0) {

                await bot.sendMessage(
                    msg.chat.id,
                    '❌ Пользователь не найден.'
                );

                return true;
            }


            const user =
                result.rows[0];

            const role =
                permissions.getRole(
                    user.telegram_id
                ) || 'USER';


            let randomStatus =
                'Не участвует в Random Chat';

            if (
                randomchatState.waiting.has(
                    user.telegram_id
                )
            ) {

                randomStatus =
                    '⏳ Ищет собеседника';

            } else if (
                randomchatState.sessions.has(
                    user.telegram_id
                )
            ) {

                const partnerId =
                    randomchatSession.getPartner(
                        user.telegram_id
                    );

                randomStatus =
                    partnerId
                        ? `💬 Общается с пользователем ${partnerId}`
                        : '💬 Находится в Random Chat';
            }


            const registered =
                new Date(
                    user.created_at
                ).toLocaleString('ru-RU');

            const lastSeen =
                new Date(
                    user.last_seen
                ).toLocaleString('ru-RU');


            let text =
`👤 Пользователь

🆔 Telegram ID: ${user.telegram_id}
👤 Имя: ${user.first_name || '—'}
🔗 Username: ${user.username ? '@' + user.username : '—'}

📅 Регистрация: ${registered}
🕐 Последняя активность: ${lastSeen}

🔐 Верификация: ${user.verified ? 'Да' : 'Нет'}
💎 Premium: ${user.premium ? 'Да' : 'Нет'}

${randomStatus}

💬 Чатов: ${user.chat_count}
💬 Сообщений: ${user.message_count}`;


            if (
                permissions.isSuperAdmin(
                    msg.from.id
                )
            ) {

                text +=
`

🔎 Расширенная информация

Пол: ${user.gender || '—'}
Возраст: ${user.age || '—'}
Город: ${user.city || '—'}
Цель: ${user.goal || '—'}
Роль: ${role}`;

            }


            const keyboard = [];

            if (
                permissions.canViewChatContent(
                    msg.from.id
                )
            ) {

                keyboard.push([
                    {
                        text:
                            `💬 Чаты пользователя (${user.chat_count})`,
                        callback_data:
                            `admin_user_chats_${user.telegram_id}`
                    }
                ]);
            }


            await bot.sendMessage(
                msg.chat.id,
                text,
                keyboard.length
                    ? {
                        reply_markup: {
                            inline_keyboard: keyboard
                        }
                    }
                    : undefined
            );

            return true;

        } catch (error) {

            console.error(
                'Admin Users error:',
                error
            );

            await bot.sendMessage(
                msg.chat.id,
                '❌ Не удалось получить данные пользователя.'
            );

            return true;
        }
    }


    async showUserChats(bot, msg, telegramId) {

        try {

            if (
                !permissions.canViewChatContent(
                    msg.from.id
                )
            ) {

                await bot.sendMessage(
                    msg.chat.id,
                    '⛔ Просмотр содержимого чатов доступен только SUPER_ADMIN.'
                );

                return true;
            }


            const id =
                Number(telegramId);

            if (
                !Number.isSafeInteger(id) ||
                id <= 0
            ) {

                await bot.sendMessage(
                    msg.chat.id,
                    '❌ Некорректный Telegram ID пользователя.'
                );

                return true;
            }


            const userResult =
                await db.query(
                    `
                    SELECT
                        telegram_id,
                        username,
                        first_name
                    FROM users
                    WHERE telegram_id = $1
                    LIMIT 1
                    `,
                    [id]
                );


            if (
                userResult.rows.length === 0
            ) {

                await bot.sendMessage(
                    msg.chat.id,
                    '❌ Пользователь не найден.'
                );

                return true;
            }


            const user =
                userResult.rows[0];


            const result =
                await db.query(
                    `
                    SELECT
                        d.id,
                        d.dialog_type,
                        d.user1,
                        d.user2,
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

                    WHERE
                        d.user1 = $1
                        OR d.user2 = $1

                    GROUP BY
                        d.id,
                        d.dialog_type,
                        d.user1,
                        d.user2,
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
                    `,
                    [id]
                );


            const displayName =
                user.username
                    ? '@' + user.username
                    : user.first_name || '—';


            if (
                result.rows.length === 0
            ) {

                await bot.sendMessage(
                    msg.chat.id,
                    `💬 Чаты пользователя

👤 ${displayName}
🆔 ID: ${id}

Чатов пока нет.`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text:
                                            '⬅️ К пользователю',
                                        callback_data:
                                            `admin_user_${id}`
                                    }
                                ]
                            ]
                        }
                    }
                );

                return true;
            }


            let totalMessages = 0;
            let nikaChats = 0;
            let randomChats = 0;
            let activeChats = 0;
            let completedChats = 0;


            for (
                const chat of result.rows
            ) {

                const count =
                    Number(
                        chat.message_count
                    ) || 0;

                totalMessages += count;


                if (
                    chat.dialog_type === 'nika'
                ) {

                    nikaChats++;

                } else {

                    randomChats++;
                }


                if (
                    chat.active
                ) {

                    activeChats++;

                } else {

                    completedChats++;
                }
            }


            const firstChat =
                result.rows[
                    result.rows.length - 1
                ];

            const lastChat =
                result.rows[0];


            const formatDate =
                (value) => {

                    if (!value) {
                        return '—';
                    }

                    return new Date(
                        value
                    ).toLocaleString(
                        'ru-RU'
                    );
                };


            let text =
`💬 Чаты пользователя

👤 ${displayName}
🆔 ID: ${id}

📊 Анализ

Всего чатов: ${result.rows.length}
💬 Общее сообщений: ${totalMessages}
🤖 Чатов с Никой: ${nikaChats}
👥 Random Chat: ${randomChats}
🟢 Активных: ${activeChats}
🔴 Завершённых: ${completedChats}

🗓 Первое общение: ${formatDate(firstChat.started_at)}
🕐 Последнее общение: ${formatDate(lastChat.started_at)}

Выберите чат:`;


            const keyboard =
                result.rows.map(
                    (chat) => {

                        const isNika =
                            chat.dialog_type === 'nika';


                        let partner;


                        if (isNika) {

                            partner =
                                '🤖 Ника';

                        } else {

                            const partnerId =
                                chat.user1 === id
                                    ? chat.user2
                                    : chat.user1;

                            const partnerUsername =
                                chat.user1 === id
                                    ? chat.user2_username
                                    : chat.user1_username;

                            const partnerFirstName =
                                chat.user1 === id
                                    ? chat.user2_first_name
                                    : chat.user1_first_name;


                            partner =
                                partnerUsername
                                    ? '@' + partnerUsername
                                    : partnerFirstName ||
                                      partnerId;
                        }


                        const status =
                            chat.active
                                ? '🟢'
                                : '🔴';


                        const date =
                            new Date(
                                chat.started_at
                            ).toLocaleDateString(
                                'ru-RU'
                            );


                        const count =
                            Number(
                                chat.message_count
                            ) || 0;


                        return [
                            {
                                text:
                                    `${status} ${partner} · ${date} · ${count} сообщ.`,

                                callback_data:
                                    `admin_chat_${chat.id}`
                            }
                        ];
                    }
                );


            keyboard.push([
                {
                    text:
                        '⬅️ К пользователю',

                    callback_data:
                        `admin_user_${id}`
                }
            ]);


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
                'Admin User Chats error:',
                error
            );

            await bot.sendMessage(
                msg.chat.id,
                '❌ Не удалось получить чаты пользователя.'
            );

            return true;
        }
    }

}


module.exports = new Users();
