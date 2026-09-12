const state = require('./state');
const queue = require('./queue');
const session = require('./session');
const matcher = require('./matcher');
const relay = require('./relay');
const keyboard = require('./keyboard');

function clearTimer(userId) {
    const timer = state.timers.get(userId);

    if (timer) {
        clearTimeout(timer);
        state.timers.delete(userId);
    }
}

async function findRandom(bot, msg) {
    const userId = msg.chat.id;

    if (session.isInDialog(userId)) {
        const partnerId = session.disconnect(userId);

        if (partnerId) {
            await bot.sendMessage(
                partnerId,
                '❌ Собеседник начал новый поиск.'
            );
        }
    }

    queue.remove(userId);
    clearTimer(userId);

    const partnerId = matcher.match(userId);

    if (partnerId) {
        clearTimer(partnerId);

        await bot.sendMessage(
            userId,
            '✅ Новый собеседник найден!',
            keyboard.dialogKeyboard()
        );

        await bot.sendMessage(
            partnerId,
            '✅ Новый собеседник найден!',
            keyboard.dialogKeyboard()
        );

        return true;
    }

    queue.add(userId);

    const timer = setTimeout(async () => {
        queue.remove(userId);
        state.timers.delete(userId);

        await bot.sendMessage(
            userId,
            '⌛ Поиск остановлен. Нажмите «🎲 Случайный собеседник», чтобы попробовать снова.',
            keyboard.searchKeyboard()
        );
    }, 300000);

    state.timers.set(userId, timer);

    await bot.sendMessage(
        userId,
        '🔍 Ищем случайного собеседника...',
        keyboard.searchKeyboard()
    );

    return true;
}

async function handle(bot, msg) {
    const userId = msg.chat.id;

    if (msg.text === '❌ Завершить диалог') {
        const partnerId = session.disconnect(userId);

        clearTimer(userId);
        queue.remove(userId);

        if (!partnerId) {
            await bot.sendMessage(
                userId,
                'У вас нет активного диалога.',
                keyboard.searchKeyboard()
            );

            return true;
        }

        await bot.sendMessage(
            userId,
            '❌ Диалог завершён.',
            keyboard.searchKeyboard()
        );

        await bot.sendMessage(
            partnerId,
            '❌ Собеседник покинул чат.',
            keyboard.searchKeyboard()
        );

        return true;
    }

    if (session.isInDialog(userId)) {
        return await relay(bot, msg);
    }

    return false;
}

function leave(userId) {
    const partnerId = session.disconnect(userId);

    queue.remove(userId);
    clearTimer(userId);

    return partnerId;
}

module.exports = {
    findRandom,
    handle,
    leave
};
