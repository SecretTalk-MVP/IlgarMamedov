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

    return true;
}

async function showAgeSelection(bot, msg) {
    await bot.sendMessage(
        msg.chat.id,
        "Укажите ваш возраст:",
        {
            reply_markup: {
                keyboard: [
                    ["⬅️ Назад"]
                ],
                resize_keyboard: true
            }
        }
    );
}

async function handleAgeSelection(bot, msg) {
    const text = (msg.text || "").trim();

    if (!/^\d+$/.test(text)) {
        await bot.sendMessage(
            msg.chat.id,
            "Введите возраст числом, например: 46"
        );

        return false;
    }

    try {
        await profile.setAge(
            msg.from.id,
            Number(text)
        );
    } catch (error) {
        await bot.sendMessage(
            msg.chat.id,
            "Возраст должен быть от 18 до 100 лет."
        );

        return false;
    }

    return true;
}

async function showCitySelection(bot, msg) {
    await bot.sendMessage(
        msg.chat.id,
        "Укажите ваш город:",
        {
            reply_markup: {
                keyboard: [
                    ["⬅️ Назад"]
                ],
                resize_keyboard: true
            }
        }
    );
}

async function handleCitySelection(bot, msg) {
    const city = (msg.text || "").trim();

    if (!city) {
        await bot.sendMessage(
            msg.chat.id,
            "Введите название города."
        );

        return false;
    }

    try {
        await profile.setCity(
            msg.from.id,
            city
        );
    } catch (error) {
        await bot.sendMessage(
            msg.chat.id,
            "Не удалось сохранить город. Попробуйте ещё раз."
        );

        return false;
    }

    return true;
}

async function showGoalSelection(bot, msg) {
    await bot.sendMessage(
        msg.chat.id,
        "Что вы ищете?",
        {
            reply_markup: {
                keyboard: [
                    ["💬 Общение"],
                    ["❤️ Знакомства"],
                    ["🤝 Дружба"],
                    ["⬅️ Назад"]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        }
    );
}

async function handleGoalSelection(bot, msg) {
    const text = msg.text || "";

    let goal = null;

    if (text === "💬 Общение") {
        goal = "chat";
    }

    if (text === "❤️ Знакомства") {
        goal = "dating";
    }

    if (text === "🤝 Дружба") {
        goal = "friendship";
    }

    if (!goal) {
        await showGoalSelection(bot, msg);
        return false;
    }

    await profile.setGoal(
        msg.from.id,
        goal
    );

    await bot.sendMessage(
        msg.chat.id,
        "✅ Профиль заполнен.",
        {
            reply_markup: {
                remove_keyboard: true
            }
        }
    );

    return true;
}

module.exports = {
    showGenderSelection,
    handleGenderSelection,
    showAgeSelection,
    handleAgeSelection,
    showCitySelection,
    handleCitySelection,
    showGoalSelection,
    handleGoalSelection
};
