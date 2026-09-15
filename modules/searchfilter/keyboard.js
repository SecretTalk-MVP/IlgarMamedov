function mainKeyboard() {
    return {
        reply_markup: {
            keyboard: [
                ['👨 Мужчины', '👩 Женщины'],
                ['🎯 Цель'],
                ['🎂 Возраст'],
                ['📍 Город'],
                ['🔄 Сбросить фильтр'],
                ['⬅️ Назад']
            ],
            resize_keyboard: true
        }
    };
}

function genderKeyboard() {
    return {
        reply_markup: {
            keyboard: [
                ['👨 Мужчины'],
                ['👩 Женщины'],
                ['🌐 Любой'],
                ['⬅️ Назад']
            ],
            resize_keyboard: true
        }
    };
}

function ageKeyboard() {
    return {
        reply_markup: {
            keyboard: [
                ['18–25', '26–35'],
                ['36–45', '46–55'],
                ['56+', '🌐 Любой'],
                ['⬅️ Назад']
            ],
            resize_keyboard: true
        }
    };
}

function goalKeyboard() {
    return {
        reply_markup: {
            keyboard: [
                ['💬 Общение'],
                ['❤️ Знакомства'],
                ['🤝 Дружба'],
                ['🌐 Любая'],
                ['⬅️ Назад']
            ],
            resize_keyboard: true
        }
    };
}

function cityKeyboard() {
    return {
        reply_markup: {
            keyboard: [
                ['🌐 Любой'],
                ['⬅️ Назад']
            ],
            resize_keyboard: true
        }
    };
}

module.exports = {
    mainKeyboard,
    genderKeyboard,
    ageKeyboard,
    goalKeyboard,
    cityKeyboard
};
