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
            await bot.sendMessage(
                userId,
                'У вас нет активного диалога.'
            );

            return true;
        }

        await bot.sendMessage(
            userId,
            '❌ Диалог завершён.'
        );

        await bot.sendMessage(
            partnerId,
            '❌ Собеседник покинул чат.'
        );

        return true;
    }

    /*
     * 2. Новый поиск собеседника.
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
                await bot.sendMessage(
                    partnerId,
                    '❌ Собеседник начал поиск нового собеседника.'
                );
            }
        }

        /*
         * Убираем пользователя из старой очереди.
         */
        queue.remove(userId);

        if (state.waitingTimers[userId]) {
            clearTimeout(state.waitingTimers[userId]);
            delete state.waitingTimers[userId];
        }

        const partnerId = matcher.findPartner(
            userId,
            aiUsers
        );

        if (partnerId) {

            if (state.waitingTimers[partnerId]) {
                clearTimeout(state.waitingTimers[partnerId]);
                delete state.waitingTimers[partnerId];
            }

            await bot.sendMessage(
                userId,
                '✅ Новый собеседник найден!'
            );

            await bot.sendMessage(
                partnerId,
                '✅ Новый собеседник найден!'
            );

        } else {

            queue.add(userId);

            state.waitingTimers[userId] = setTimeout(() => {

                queue.remove(userId);

                bot.sendMessage(
                    userId,
                    '⌛ Поиск остановлен. Нажмите «👥 Найти собеседника», чтобы попробовать снова.'
                );

                delete state.waitingTimers[userId];

            }, 300000);

            await bot.sendMessage(
                userId,
                '🔍 Ищем собеседника...'
            );
        }

        return true;
    }

    /*
     * 3. Активный human-to-human диалог.
     */
    if (dialogs.isInDialog(userId)) {

        return await relay(
            bot,
            msg,
            aiUsers
        );
    }

    return false;
}

/*
 * Пользователь покидает matchmaking
 * и переходит в режим AiDa.
 */
function leaveForAi(userId) {

    let partnerId = null;

    /*
     * Если пользователь находится
     * в активном диалоге — разрываем его.
     */
    if (dialogs.isInDialog(userId)) {
        partnerId = dialogs.disconnect(userId);
    }

    /*
     * Убираем из очереди поиска.
     */
    queue.remove(userId);

    /*
     * Останавливаем таймер поиска.
     */
    if (state.waitingTimers[userId]) {
        clearTimeout(state.waitingTimers[userId]);
        delete state.waitingTimers[userId];
    }

    return partnerId;
}

module.exports = {
    handle,
    leaveForAi
};
