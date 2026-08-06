function main() {
    return {
        reply_markup: {
            keyboard: [
                ['👥 Найти собеседника'],
                ['❌ Завершить диалог']
            ],
            resize_keyboard: true
        }
    };
}

module.exports = {
    main
};
