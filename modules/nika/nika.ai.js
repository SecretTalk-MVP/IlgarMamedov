/**
 * SecretTalk
 * Nika Module
 *
 * Nika is an independent character module.
 *
 * AI backend:
 *     ./nika.ai.js
 *
 * Character definition:
 *     ./nika.system.md
 *
 * Verification is intentionally not implemented here yet.
 * Until the dedicated verification module exists, only the Admin
 * can enter Nika for testing.
 */

const fs = require("fs");
const path = require("path");

const nikaAI = require("./nika.ai");
const permissions = require("../admin/permissions");

class Nika {

    constructor() {

        this.name = "Nika";

        this.systemPromptPath = path.join(
            __dirname,
            "nika.system.md"
        );

        this.systemPrompt = fs.readFileSync(
            this.systemPromptPath,
            "utf-8"
        );

        console.log("✅ Nika initialized");
        console.log(
            "🌶️ Nika character:",
            this.systemPromptPath
        );
    }

    isAdmin(userId) {
        return permissions.isAdmin(userId);
    }

    async ask(userId, userMessage) {

        if (!userId) {
            throw new Error("Nika requires userId");
        }

        if (
            !userMessage ||
            !String(userMessage).trim()
        ) {
            throw new Error("Nika requires userMessage");
        }

        return await nikaAI.generate(
            this.systemPrompt.trim(),
            String(userMessage).trim()
        );
    }

    async handle(bot, msg) {

        if (!msg || !msg.from || !msg.chat) {
            return false;
        }

        if (!msg.text) {
            return false;
        }

        const userId = msg.from.id;

        /*
         * TEMPORARY ADMIN EXCEPTION
         *
         * The Admin may enter Nika without verification.
         *
         * This is only for development/testing.
         * It will be replaced by the Verification module later.
         */

        if (!this.isAdmin(userId)) {

            await bot.sendMessage(
                msg.chat.id,
                "🔐 Для общения с Никой сначала необходимо пройти верификацию."
            );

            return true;
        }

        const answer = await this.ask(
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
