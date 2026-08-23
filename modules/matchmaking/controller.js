const state = require("./state");
const queue = require("./queue");
const matcher = require("./matcher");
const dialogs = require("./dialogs");
const relay = require("./relay");

async function findRandom(bot, msg, aiUsers) {
    const userId = msg.chat.id;

    if (dialogs.isInDialog(userId)) {
        const partnerId = dialogs.disconnect(userId);

        if (partnerId) {
            await bot.sendMessage(
                partnerId,
                "❌ Собеседник начал новый поиск."
            );
        }
    }

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
            "✅ Новый собеседник найден!"
        );

        await bot.sendMessage(
            partnerId,
            "✅ Новый собеседник найден!"
        );

        return true;
    }

    queue.add(userId);

    state.waitingTimers[userId] = setTimeout(() => {
        queue.remove(userId);

        bot.sendMessage(
            userId,
            "⌛ Поиск остановлен. Нажмите «👥 Найти собеседника», чтобы попробовать снова."
        );

        delete state.waitingTimers[userId];
    }, 300000);

    await bot.sendMessage(
        userId,
        "🔍 Ищем случайного собеседника..."
    );

    return true;
}

async function handle(bot, msg, aiUsers) {
    const userId = msg.chat.id;

    if (msg.text === "❌ Завершить диалог") {
        const partnerId = dialogs.disconnect(userId);

        if (!partnerId) {
            await bot.sendMessage(
                userId,
                "У вас нет активного диалога."
            );

            return true;
        }

        await bot.sendMessage(
            userId,
            "❌ Диалог завершён."
        );

        await bot.sendMessage(
            partnerId,
            "❌ Собеседник покинул чат."
        );

        return true;
    }

    if (dialogs.isInDialog(userId)) {
        return await relay(
            bot,
            msg,
            aiUsers
        );
    }

    return false;
}

function leaveForAi(userId) {
    let partnerId = null;

    if (dialogs.isInDialog(userId)) {
        partnerId = dialogs.disconnect(userId);
    }

    queue.remove(userId);

    if (state.waitingTimers[userId]) {
        clearTimeout(state.waitingTimers[userId]);
        delete state.waitingTimers[userId];
    }

    return partnerId;
}

function leaveForCharacter(userId) {
    let partnerId = null;

    if (dialogs.isInDialog(userId)) {
        partnerId = dialogs.disconnect(userId);
    }

    queue.remove(userId);

    if (state.waitingTimers[userId]) {
        clearTimeout(state.waitingTimers[userId]);
        delete state.waitingTimers[userId];
    }

    return partnerId;
}

module.exports = {
    findRandom,
    handle,
    leaveForAi,
    leaveForCharacter
};
