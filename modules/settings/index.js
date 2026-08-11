const filters = require('../matchmaking/filters');
const queue = require('../matchmaking/queue');
const dialogs = require('../matchmaking/dialogs');
const state = require('../matchmaking/state');

async function handle(bot, msg, aiUsers) {

    const userId = msg.chat.id;
    const text = msg.text;

    /*
     * Вход в настройки поиска.
     */
    if (text === '⚙️ Фильтр поиска') {

        delete aiUsers[userId];

        queue.remove(userId);

        if (state.waitingTimers[userId]) {
            clearTimeout(state.waitingTimers[userId]);
            delete state.waitingTimers[userId];
        }

        if (dialogs.isInDialog(userId)) {

            const partnerId = dialogs.disconnect(userId);

            if (partnerId) {
                await bot.sendMessage(
                    partnerId,
                    '❌ Собеседник перешёл в настройки поиска.'
                );
            }
        }

        await bot.sendMessage(
            userId,
            '⚙️ Фильтр поиска\n\nВыберите параметр:',
            {
                reply_markup: {
                    keyboard: [
                        ['👨 Мой пол'],
                        ['🎂 Мой возраст'],
                        ['🎯 Цель знакомства'],
                        ['⬅️ Назад']
                    ],
                    resize_keyboard: true
                }
            }
        );

        return true;
    }

    /*
     * Мой пол.
     */
    if (text === '👨 Мой пол') {

        await bot.sendMessage(
            userId,
            'Выберите ваш пол:',
            {
                reply_markup: {
                    keyboard: [
                        ['👨 Мужчина'],
                        ['👩 Женщина'],
                        ['⬅️ Назад']
                    ],
                    resize_keyboard: true
                }
            }
        );

        return true;
    }

    /*
     * Сохранение пола.
     */
    if (text === '👨 Мужчина' || text === '👩 Женщина') {

        const current = filters.get(userId);

        filters.set(userId, {
            ...current,
            gender: text
        });

        await bot.sendMessage(
            userId,
            `✅ Пол сохранён: ${text}`,
            {
                reply_markup: {
                    keyboard: [
                        ['👨 Мой пол'],
                        ['🎂 Мой возраст'],
                        ['🎯 Цель знакомства'],
                        ['⬅️ Назад']
                    ],
                    resize_keyboard: true
                }
            }
        );

        return true;
    }

    /*
     * Мой возраст.
     */
    if (text === '🎂 Мой возраст') {

        const current = filters.get(userId);

        filters.set(userId, {
            ...current,
            waitingForAge: true
        });

        await bot.sendMessage(
            userId,
            '🎂 Введите ваш возраст (например: 25).\n\nТолько число.'
        );

        return true;
    }

    /*
     * Сохранение возраста.
     */
    const currentFilter = filters.get(userId);

    if (currentFilter.waitingForAge) {

        const age = parseInt(text, 10);

        if (isNaN(age) || age < 18 || age > 99) {

            await bot.sendMessage(
                userId,
                '❌ Введите возраст числом от 18 до 99.'
            );

            return true;
        }

        const {
            waitingForAge,
            ...rest
        } = currentFilter;

        filters.set(userId, {
            ...rest,
            age
        });

        await bot.sendMessage(
            userId,
            `✅ Возраст сохранён: ${age}`,
            {
                reply_markup: {
                    keyboard: [
                        ['👨 Мой пол'],
                        ['🎂 Мой возраст'],
                        ['🎯 Цель знакомства'],
                        ['⬅️ Назад']
                    ],
                    resize_keyboard: true
                }
            }
        );

        return true;
    }

    /*
     * Цель знакомства.
     */
    if (text === '🎯 Цель знакомства') {

        await bot.sendMessage(
            userId,
            'Выберите цель знакомства:',
            {
                reply_markup: {
                    keyboard: [
                        ['💬 Общение'],
                        ['🤝 Дружба'],
                        ['❤️ Отношения'],
                        ['💍 Создать семью'],
                        ['😘 Флирт'],
                        ['🔥 Одноразовая встреча'],
                        ['✈️ Попутчик'],
                        ['🎲 Не важно'],
                        ['⬅️ Назад']
                    ],
                    resize_keyboard: true
                }
            }
        );

        return true;
    }

    /*
     * Сохранение цели.
     */
    const goals = [
        '💬 Общение',
        '🤝 Дружба',
        '❤️ Отношения',
        '💍 Создать семью',
        '😘 Флирт',
        '🔥 Одноразовая встреча',
        '✈️ Попутчик',
        '🎲 Не важно'
    ];

    if (goals.includes(text)) {

        const current = filters.get(userId);

        filters.set(userId, {
            ...current,
            goal: text
        });

        await bot.sendMessage(
            userId,
            `✅ Цель установлена: ${text}\n\n🔒 Настройки используются только для автоматического поиска подходящего собеседника.`,
            {
                reply_markup: {
                    keyboard: [
                        ['👨 Мой пол'],
                        ['🎂 Мой возраст'],
                        ['🎯 Цель знакомства'],
                        ['⬅️ Назад']
                    ],
                    resize_keyboard: true
                }
            }
        );

        return true;
    }

    /*
     * Назад.
     */
    if (text === '⬅️ Назад') {

        const current = filters.get(userId);

        if (current.waitingForAge) {

            const {
                waitingForAge,
                ...rest
            } = current;

            filters.set(userId, rest);
        }

        await bot.sendMessage(
            userId,
            'Главное меню:',
            {
                reply_markup: {
                    keyboard: [
                        ['🤖 Поговорить с ИИ', '👥 Найти собеседника'],
                        ['⚙️ Фильтр поиска']
                    ],
                    resize_keyboard: true
                }
            }
        );

        return true;
    }

    return false;
}

module.exports = {
    handle
};
