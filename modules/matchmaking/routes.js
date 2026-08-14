const state = require('./state');
const queue = require('./queue');
const matcher = require('./matcher');
const dialogs = require('./dialogs');
const relay = require('./relay');

function leaveForAi(userId) {

    if (dialogs.isInDialog(userId)) {

        const partnerId = dialogs.disconnect(userId);

        if (partnerId) {
            return partnerId;
        }
    }

    queue.remove(userId);

    if (state.waitingTimers[userId]) {
        clearTimeout(state.waitingTimers[userId]);
        delete state.waitingTimers[userId];
    }

    return null;
}

async function handle(
    bot,
    msg,
    aiUsers
) {

    if (!msg || !msg.text) {
        return false;
    }

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

            clearTimeout(
                state.waitingTimers[userId]
            );

            delete state.waitingTimers[userId];
        }

        const partnerId = matcher.findPartner(
            userId,
            aiUsers
        );

        if (partnerId) {

            if (state.waitingTimers[partnerId]) {

                clearTimeout(
                    state.waitingTimers[partnerId]
                );

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

            state.waitingTimers[userId] = setTimeout(
                () => {

                    queue.remove(userId);

                    bot.sendMessage(
                        userId,
                        '⌛ Поиск остановлен. Нажмите «👥 Найти собеседника», чтобы попробовать снова.'
                    );

                    delete state.waitingTimers[userId];

                },
                300000
            );

            await bot.sendMessage(
                userId,
                '🔍 Ищем собеседника...'
            );
        }

        return true;
    }

    /*
     * 3. Если пользователь находится
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
     * 4. Это не matchmaking.
     *    Передаём управление Router.
     */
    return false;
}

module.exports = {
    handle,
    leaveForAi
};
