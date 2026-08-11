const state = require('./state');
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

    /*
     * 1. Завершение текущего human-to-human диалога.
     */
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

    /*
     * 2. Переход в режим ИИ.
     *
     * ВАЖНО:
     * Если пользователь сейчас находится
     * в human-to-human диалоге, сначала
     * разрываем этот диалог.
     *
     * После этого возвращаем false,
     * чтобы index.js передал команду
     * AIService.
     */
    if (msg.text === '🤖 Поговорить с ИИ') {

        if (dialogs.isInDialog(userId)) {

            const partnerId = dialogs.disconnect(userId);

            if (partnerId) {
                bot.sendMessage(
                    partnerId,
                    '❌ Собеседник перешёл в режим ИИ.'
                );
            }
        }

        queue.remove(userId);

        return false;
    }

    /*
     * 3. Новый поиск собеседника.
     */
    if (msg.text === '👥 Найти собеседника') {

        delete aiUsers[userId];

        /*
         * Если пользователь уже находится
         * в диалоге — сначала завершаем его.
         */
        if (dialogs.isInDialog(userId)) {

            const partnerId = dialogs.disconnect(userId);

            if (partnerId) {
                bot.sendMessage(
                    partnerId,
                    '❌ Собеседник начал поиск нового собеседника.'
                );
            }
        }

        /*
         * Убираем пользователя из старой
         * очереди перед новым поиском.
         */
        queue.remove(userId);

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

    /*
     * 4. Если пользователь находится
     *    в активном human-to-human диалоге —
     *    передаём сообщение собеседнику.
     */
    if (dialogs.isInDialog(userId)) {
        return await relay(
            bot,
            msg,
            aiUsers
        );
    }

    /*
     * 5. Это не matchmaking.
     *    Передаём управление index.js.
     */
    return false;
}

module.exports = {
    handle
};
