function registerAdminController(bot) {
  
  if (msg.text === '/admin') {

  if (msg.from.id !== 1496574112) {
    bot.sendMessage(
      msg.chat.id,
      '⛔ Доступ запрещён.'
    );
    return;
  }
    pushHistory(msg.chat.id, 'admin');

  bot.sendMessage(
    msg.chat.id,
    '👑 Панель администратора',
    {
      reply_markup: {
        keyboard: [
          ['👥 Онлайн', '📊 Статистика'],
          ['📢 Рассылка', '💬 Активные чаты'],
          ['⚙️ Settings'],
        ],
        resize_keyboard: true
      }
    }
  );

  return;
}

}

module.exports = {
  registerAdminController
};
