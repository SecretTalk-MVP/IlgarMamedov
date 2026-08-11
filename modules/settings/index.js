const state = require('../matchmaking/state');
const queue = require('../matchmaking/queue');
const dialogs = require('../matchmaking/dialogs');

const users = {};

async function handle(bot, msg, aiUsers) {

    const userId = msg.chat.id;
    const text = msg.text;

    /*
     * 1. Вход в фильтр поиска.
     */
    if (text === '⚙️ Фильтр поиска') {

        /*
         * Если пользователь был в AiDa —
         * выключаем режим ИИ.
         */
        delete aiUsers[userId];

        /*
         * Если пользователь был в поиске —
         * убираем его из очереди.
         */
        queue.remove(userId);

        /*
         * Если пользователь был в human-to-human
         * диалоге — разрываем его.
         */
        if (dialogs.isInDialog(userId)) {

            const partnerId = dialogs.disconnect(userId);

            if (partnerId) {
                await bot.sendMessage(
                    partnerId,
                    '❌ Собеседник перешёл в настройки поиска.'
                );
            }
        }

        /*
         * Создаём настройки пользователя,
         * если их ещё нет.
         */
        if (!state.filters[userId]) {
            state.filters[userId] = {
                gender: null,
                age: null,
                goal: null
            };
        }

        await bot.sendMessage(
            userId,
            '⚙️ Настройки поиска\n\nВыберите параметр:',
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
     * 2. Мой пол.
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
     * 3. Сохранение пола.
     */
    if (text === '👨 Мужчина' || text === '👩 Женщина') {

        if (!state.filters[userId]) {
            state.filters[userId] = {};
        }

        state.filters[userId].gender = text;

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
     * 4. Мой возраст.
     */
    if (text === '🎂 Мой возраст') {

        if (!state.filters[userId]) {
            state.filters[userId] = {};
        }

        state.filters[userId].waitingForAge = true;

        await bot.sendMessage(
            userId,
            '🎂 Введите ваш возраст (например: 25).\n\nТолько число.'
        );

        return true;
    }

    /*
     * 5. Получение возраста.
     */
    if (
        state.filters[userId] &&
        state.filters[userId].waitingForAge
    ) {

        const age = parseInt(text, 10);

        if (isNaN(age) || age < 18 || age > 99) {

            await bot.sendMessage(
                userId,
                '❌ Введите возраст числом от 18 до 99.'
            );

            return true;
        }

        state.filters[userId].age = age;
        delete state.filters[userId].waitingForAge;

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
     * 6. Цель знакомства.
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
     * 7. Сохранение цели.
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

        if (!state.filters[userId]) {
            state.filters[userId] = {};
        }

        state.filters[userId].goal = text;

        await bot.sendMessage(
            userId,
            `✅ Цель установлена: ${text}\n\n🔒 Настройки используются только для автоматического поиска подходящего собеседника.`
        );

        return true;
    }

    /*
     * 8. Назад.
     */
    if (text === '⬅️ Назад') {

        delete state.filters[userId]?.waitingForAge;

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
