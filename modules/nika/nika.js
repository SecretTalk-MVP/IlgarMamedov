/**
 * SecretTalk
 * Nika Module
 *
 * Independent module.
 *
 * Router integration is intentionally absent at this stage.
 */

class Nika {

    constructor() {
        this.name = "Nika";

        console.log("✅ Nika initialized");
    }

    async ask(userId, userMessage) {

        if (!userId) {
            throw new Error("Nika requires userId");
        }

        if (!userMessage || !String(userMessage).trim()) {
            throw new Error("Nika requires userMessage");
        }

        return `Привет. Я Ника. Ты сказал: ${String(userMessage).trim()}`;
    }

    async handle(bot, msg) {

        if (!msg || !msg.from || !msg.chat) {
            return false;
        }

        if (!msg.text) {
            return false;
        }

        const userId = msg.from.id;

        const answer =
            await this.ask(
                userId,
                msg.text
            );

        await bot.sendMessage(
            msg.chat.id,
            answer
        );

        return true;
    }
}

module.exports = new Nika();
