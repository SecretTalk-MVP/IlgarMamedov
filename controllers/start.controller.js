const {
    pushHistory
} = require('./navigation.controller');

function registerStartController(bot) {

    bot.onText(/\/start/, (msg) => {

        pushHistory(msg.chat.id, 'main');

        bot.sendMessage(
            msg.chat.id,
            'Добро пожаловать в SecretTalk 🚀\n\nВыберите действие:',
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

    });

}

module.exports = {
    registerStartController
};
