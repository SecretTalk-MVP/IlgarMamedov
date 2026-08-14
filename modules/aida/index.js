/**
 * SecretTalk
 * AiDa User Module
 * Version: 1.1
 */

const aiService = require('../../ai');

const aiUsers = {};

async function handle(bot, msg) {

    if (!msg || !msg.text) {
        return false;
    }

    const userId = msg.chat.id;
    const text = msg.text;

    /*
     * Переход в режим AiDa.
     */
    if (text === '🤖 Поговорить с ИИ') {

        aiUsers[userId] = true;

        await bot.sendMessage(
            userId,
            '🤖 Режим AiDa включён.\nНапишите любое сообщение.'
        );

        return true;
    }

    /*
     * Кнопки других модулей.
     * Передаём управление Router.
     */
    const externalButtons = [
        '👥 Найти собеседника',
        '⚙️ Фильтр поиска',
        '👑 Админ',
        '👑 Admin',
        'Админ',
        'Admin'
    ];

    if (externalButtons.includes(text)) {

        delete aiUsers[userId];

        return false;
    }

    /*
     * Пользователь не находится
     * в режиме AiDa.
     */
    if (!aiUsers[userId]) {
        return false;
    }

    /*
     * Передача сообщения AiDa.
     */
    try {

        console.log(
            '🤖 AiDa request:',
            userId,
            text
        );

        const answer = await aiService.ask(
            userId,
            [
                {
                    role: 'user',
                    content: text
                }
            ]
        );

        console.log(
            '🤖 AiDa answer:',
            answer
        );

        await bot.sendMessage(
            userId,
            answer
        );

        return true;

    } catch (error) {

        console.error(
            '❌ AiDa error:',
            error
        );

        await bot.sendMessage(
            userId,
            '❌ AiDa не смогла ответить. Ошибка записана в лог.'
        );

        return true;
    }
}

module.exports = {
    handle,
    users: aiUsers
};
