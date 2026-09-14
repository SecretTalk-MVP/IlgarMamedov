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
                        FROM messages
                        WHERE messages.sender = users.telegram_id
                    ) AS message_count

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


            await bot.sendMessage(
                msg.chat.id,
                text
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

}


module.exports = new Users();
