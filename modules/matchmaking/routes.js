const queue = require('./queue');
const matcher = require('./matcher');
const dialogs = require('./dialogs');
const relay = require('./relay');

async function handle(
    bot,
    msg,
    aiUsers
) {
    const userId = msg.chat.id;

    if (
        msg.text !== '👥 Найти собеседника' &&
        msg.text !== '❌ Завершить диалог'
    ) {
        return await relay(bot, msg, aiUsers);
    }

    if (msg.text === '❌ Завершить диалог') {
        const partnerId = dialogs.disconnect(userId);

        if (!partnerId) {
            bot.sendMessage(
                userId,
                'У вас нет активного диалога.'
            );

            return true;
        }

        bot.sendMessage(
            userId,
            '❌ Диалог завершён.'
        );

        bot.sendMessage(
            partnerId,
            '❌ Собеседник покинул чат.'
        );

        return true;
    }

    delete aiUsers[userId];

    if (dialogs.isInDialog(userId)) {
        const partnerId = dialogs.disconnect(userId);

        if (partnerId) {
            bot.sendMessage(
                partnerId,
                '❌ Собеседник начал поиск нового собеседника.'
            );
        }
    }

    if (queue.has(userId)) {
        return true;
    }

    const partnerId = matcher.findPartner(
        userId,
        aiUsers
    );

    if (partnerId) {
        bot.sendMessage(
            userId,
            '✅ Новый собеседник найден!'
        );

        bot.sendMessage(
            partnerId,
            '✅ Новый собеседник найден!'
        );
    } else {
        queue.add(userId);

        bot.sendMessage(
            userId,
            '🔍 Ищем собеседника...'
        );
    }

    return true;
}

module.exports = {
    handle
};
