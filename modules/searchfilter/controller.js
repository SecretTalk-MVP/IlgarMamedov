const state = require('./state');
const keyboard = require('./keyboard');

class SearchFilter {

    async show(bot, msg) {

        const userId = msg.from.id;
        const filter = state.get(userId);

        filter.activeField = null;

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

        if (text === '👤 Пол') {

            filter.activeField = 'gender';

            await bot.sendMessage(
                msg.chat.id,
                'Кого искать?',
                keyboard.genderKeyboard()
            );

            return true;
        }

        if (text === '🎯 Цель') {

            filter.activeField = 'goal';

            await bot.sendMessage(
                msg.chat.id,
                'Выберите цель:',
                keyboard.goalKeyboard()
            );

            return true;
        }

        if (text === '🎂 Возраст') {

            filter.activeField = 'age';

            await bot.sendMessage(
                msg.chat.id,
                'Выберите возраст:',
                keyboard.ageKeyboard()
            );

            return true;
        }

        if (text === '📍 Город') {

            filter.activeField = 'city';

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

        if (text === '⬅️ Назад') {

            filter.activeField = null;

            return false;
        }

        if (filter.activeField === 'gender') {

            if (text === '👨 Мужчины') {
                filter.preferredGender = 'male';
                return this.show(bot, msg);
            }

            if (text === '👩 Женщины') {
                filter.preferredGender = 'female';
                return this.show(bot, msg);
            }

            if (text === '🌐 Любой') {
                filter.preferredGender = null;
                return this.show(bot, msg);
            }

            return true;
        }

        if (filter.activeField === 'age') {

            if (text === '18–25') {
                filter.preferredAgeMin = 18;
                filter.preferredAgeMax = 25;
                return this.show(bot, msg);
            }

            if (text === '26–35') {
                filter.preferredAgeMin = 26;
                filter.preferredAgeMax = 35;
                return this.show(bot, msg);
            }

            if (text === '36–45') {
                filter.preferredAgeMin = 36;
                filter.preferredAgeMax = 45;
                return this.show(bot, msg);
            }

            if (text === '46–55') {
                filter.preferredAgeMin = 46;
                filter.preferredAgeMax = 55;
                return this.show(bot, msg);
            }

            if (text === '56+') {
                filter.preferredAgeMin = 56;
                filter.preferredAgeMax = null;
                return this.show(bot, msg);
            }

            if (text === '🌐 Любой') {
                filter.preferredAgeMin = null;
                filter.preferredAgeMax = null;
                return this.show(bot, msg);
            }

            return true;
        }

        if (filter.activeField === 'goal') {

            if (text === '💬 Общение') {
                filter.preferredGoal = 'chat';
                return this.show(bot, msg);
            }

            if (text === '❤️ Знакомства') {
                filter.preferredGoal = 'dating';
                return this.show(bot, msg);
            }

            if (text === '🤝 Дружба') {
                filter.preferredGoal = 'friendship';
                return this.show(bot, msg);
            }

            if (text === '🌐 Любая') {
                filter.preferredGoal = null;
                return this.show(bot, msg);
            }

            return true;
        }

        if (filter.activeField === 'city') {

            if (text === '🌐 Любой') {
                filter.preferredCity = null;
                return this.show(bot, msg);
            }

            const city = text.trim();

            if (city.length > 0) {
                filter.preferredCity = city;
                return this.show(bot, msg);
            }

            return true;
        }

        return false;
    }

    buildSummary(filter) {

        const genderMap = {
            male: 'Мужчины',
            female: 'Женщины'
        };

        const gender =
            genderMap[filter.preferredGender] || 'Любой';

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
