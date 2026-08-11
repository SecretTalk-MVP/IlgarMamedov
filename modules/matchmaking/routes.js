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
     * Переход в другую функцию.
     *
     * Эта кнопка принадлежит AiDa, а не matchmaking.
     * Если пользователь сейчас разговаривает с человеком,
     * сначала завершаем этот диалог, затем возвращаем
     * управление index.js.
     */
    if (msg.text === '🤖 Поговорить с ИИ') {

        delete aiUsers[userId];

        if (dialogs.isInDialog(userId)) {

            const partnerId = dialogs.disconnect(userId);

            if (partnerId) {
                bot.sendMessage(
                    partnerId,
                    '❌ Собеседник покинул чат.'
                );
            }
        }

        return false;
    }

    /*
     * Завершение текущего диалога.
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
     * Новый поиск собеседника.
     */
    if (msg.text === '👥 Найти собеседника') {

        delete aiUsers[userId];

        /*
         * Если пользователь уже был в диалоге,
         * сначала разрываем старый диалог.
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
         * Не добавляем одного пользователя
         * в очередь несколько раз.
         */
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

    /*
     * Обычное сообщение.
     *
     * Только если пользователь действительно
     * находится в активном диалоге,
     * сообщение передаётся собеседнику.
     */
    if (dialogs.isInDialog(userId)) {

        return await relay(
            bot,
            msg,
            aiUsers
        );
    }

    /*
     * Это не функция matchmaking.
     *
     * Возвращаем false, чтобы index.js
     * продолжил обработку сообщения:
     *
     * AiDa, профиль, настройки и т.д.
     */
    return false;
}

module.exports = {
    handle
};
