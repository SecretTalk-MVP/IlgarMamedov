const profile = require("./profile");

async function showGenderSelection(bot, msg) {
    await bot.sendMessage(
        msg.chat.id,
        "Укажите ваш пол:",
        {
            reply_markup: {
                keyboard: [
                    ["👨 Мужчина"],
                    ["👩 Женщина"]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        }
    );
}

async function handleGenderSelection(bot, msg) {
    const text = msg.text || "";

    let gender = null;

    if (text === "👨 Мужчина") {
        gender = "male";
    }

    if (text === "👩 Женщина") {
        gender = "woman";
    }

    if (!gender) {
        await showGenderSelection(bot, msg);
        return false;
    }

    await profile.setGender(
        msg.from.id,
        gender
    );

    await bot.sendMessage(
        msg.chat.id,
        "✅ Профиль сохранён."
    );

    return true;
}

module.exports = {
    showGenderSelection,
    handleGenderSelection
};
