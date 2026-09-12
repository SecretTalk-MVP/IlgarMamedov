function searchKeyboard() {
    return {
        reply_markup: {
            keyboard: [
                ['🎲 Случайный собеседник'],
                ['⬅️ Назад']
            ],
            resize_keyboard: true
        }
    };
}

function dialogKeyboard() {
    return {
        reply_markup: {
            keyboard: [
                ['❌ Завершить диалог']
            ],
            resize_keyboard: true
        }
    };
}

module.exports = {
    searchKeyboard,
    dialogKeyboard
};
