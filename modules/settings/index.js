async function handle(bot, msg, aiUsers) {
    const userId = msg.chat.id;

    if (msg.text !== '⚙️ Фильтр поиска') {
        return false;
    }

    delete aiUsers[userId];

    await bot.sendMessage(
        userId,
        `Мэр, укажите параметры фильтра поиска:

1. **Пол / кто нужен**: любой, парень, девушка
2. **Возраст**: например 18–25
3. **Город / страна**
4. **Интересы**: общение, дружба, отношения, игры и т.д.
5. **Онлайн сейчас**: да / нет

Напишите, что именно хотите отфильтровать — помогу настроить.`
    );

    return true;
}

module.exports = {
    handle
};
