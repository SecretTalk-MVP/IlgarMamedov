function search() {
    return {
        reply_markup: {
            keyboard: [
                ["🎲 Случайного собеседника"],
                ["🤖 Выбрать персонажа"],
                ["⬅️ Назад"]
            ],
            resize_keyboard: true
        }
    };
}

function dialog() {
    return {
        reply_markup: {
            keyboard: [
                ["❌ Завершить диалог"],
                ["⬅️ Назад"]
            ],
            resize_keyboard: true
        }
    };
}

module.exports = {
    search,
    dialog
};
