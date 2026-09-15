const state = require('./state');
const keyboard = require('./keyboard');

class SearchFilter {

    async show(bot, msg) {

        const userId = msg.from.id;
        const filter = state.get(userId);

        await bot.sendMessage(
            msg.chat.id,
            this.buildSummary(filter),
            keyboard.mainKeyboard()
        );

        return true;
    }

    async handle(bot, msg) {

        const userId = msg.from.id;
        const text = msg.text;

        if (!text) {
            return false;
        }

        const filter = state.get(userId);

        if (text === '👨 Мужчины') {
            await bot.sendMessage(
                msg.chat.id,
                'Кого искать?',
                keyboard.genderKeyboard()
            );
            return true;
        }

        if (text === '👩 Женщины') {
            await bot.sendMessage(
                msg.chat.id,
                'Кого искать?',
                keyboard.genderKeyboard()
            );
            return true;
        }

        if (text === '🎯 Цель') {
            await bot.sendMessage(
                msg.chat.id,
                'Выберите цель:',
                keyboard.goalKeyboard()
            );
            return true;
        }

        if (text === '🎂 Возраст') {
            await bot.sendMessage(
                msg.chat.id,
                'Выберите возраст:',
                keyboard.ageKeyboard()
            );
            return true;
        }

        if (text === '📍 Город') {
            await bot.sendMessage(
                msg.chat.id,
                'Введите город или выберите «🌐 Любой».',
                keyboard.cityKeyboard()
            );
            return true;
        }

        if (text === '🔄 Сбросить фильтр') {
            state.reset(userId);

            await bot.sendMessage(
                msg.chat.id,
                '🔄 Фильтр сброшен.',
                keyboard.mainKeyboard()
            );

            return true;
        }

        if (text === '🌐 Любой') {

            filter.preferredGender = null;
            filter.preferredAgeMin = null;
            filter.preferredAgeMax = null;
            filter.preferredCity = null;
            filter.preferredGoal = null;

            await bot.sendMessage(
                msg.chat.id,
                '🌐 Значение сброшено.',
                keyboard.mainKeyboard()
            );

            return true;
        }

        if (text === '💬 Общение') {
            filter.preferredGoal = 'chat';
            await this.show(bot, msg);
            return true;
        }

        if (text === '❤️ Знакомства') {
            filter.preferredGoal = 'dating';
            await this.show(bot, msg);
            return true;
        }

        if (text === '🤝 Дружба') {
            filter.preferredGoal = 'friendship';
            await this.show(bot, msg);
            return true;
        }

        if (text === '18–25') {
            filter.preferredAgeMin = 18;
            filter.preferredAgeMax = 25;
            await this.show(bot, msg);
            return true;
        }

        if (text === '26–35') {
            filter.preferredAgeMin = 26;
            filter.preferredAgeMax = 35;
            await this.show(bot, msg);
            return true;
        }

        if (text === '36–45') {
            filter.preferredAgeMin = 36;
            filter.preferredAgeMax = 45;
            await this.show(bot, msg);
            return true;
        }

        if (text === '46–55') {
            filter.preferredAgeMin = 46;
            filter.preferredAgeMax = 55;
            await this.show(bot, msg);
            return true;
        }

        if (text === '56+') {
            filter.preferredAgeMin = 56;
            filter.preferredAgeMax = null;
            await this.show(bot, msg);
            return true;
        }

        if (text === '⬅️ Назад') {
            return false;
        }

        return false;
    }

    buildSummary(filter) {

        const gender =
            filter.preferredGender || 'Любой';

        let age = 'Любой';

        if (
            filter.preferredAgeMin !== null &&
            filter.preferredAgeMax !== null
        ) {
            age =
                `${filter.preferredAgeMin}–${filter.preferredAgeMax}`;
        } else if (
            filter.preferredAgeMin !== null
        ) {
            age =
                `${filter.preferredAgeMin}+`;
        }

        const city =
            filter.preferredCity || 'Любой';

        const goalMap = {
            chat: 'Общение',
            dating: 'Знакомства',
            friendship: 'Дружба'
        };

        const goal =
            goalMap[filter.preferredGoal] || 'Любая';

        return (
`⚙️ Фильтр поиска

👤 Пол: ${gender}
🎂 Возраст: ${age}
📍 Город: ${city}
🎯 Цель: ${goal}`
        );
    }
}

module.exports = new SearchFilter();
