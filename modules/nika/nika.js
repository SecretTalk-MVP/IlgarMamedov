/**
 * SecretTalk
 * Nika Module
 *
 * Independent character module.
 *
 * AI:
 *     ./nika.ai.js
 *
 * Character:
 *     ./nika.system.md
 *
 * Conversation:
 *     ./nika.conversation.js
 *
 * Verification:
 *     Will be connected later.
 *
 * Admin:
 *     Temporary development bypass.
 */

const fs = require("fs");
const path = require("path");

const nikaAI = require("./nika.ai");
const nikaConversation = require("./nika.conversation");
const permissions = require("../admin/permissions");

class Nika {

    constructor() {

        this.name = "Nika";

        this.systemPromptPath = path.join(
            __dirname,
            "nika.system.md"
        );

        this.systemPrompt =
            fs.readFileSync(
                this.systemPromptPath,
                "utf-8"
            );

        console.log("✅ Nika initialized");
        console.log(
            "🌶️ Nika character:",
            this.systemPromptPath
        );
    }


    async ask(userId, userMessage) {

        if (!userId) {
            throw new Error(
                "Nika requires userId"
            );
        }

        if (
            !userMessage ||
            !String(userMessage).trim()
        ) {
            throw new Error(
                "Nika requires userMessage"
            );
        }

        const message =
            String(userMessage).trim();


        /*
         * Load recent conversation history.
         *
         * Long-term memory is intentionally not used.
         */
        const previousMessages =
            nikaConversation.getMessages(
                userId
            );


        /*
         * Build conversation context.
         */
        const conversationMessages = [
            ...previousMessages,
            {
                role: "user",
                content: message
            }
        ];


        /*
         * Generate response using:
         *
         * 1. Nika character
         * 2. Conversation history
         * 3. Current user message
         */
        const answer =
            await nikaAI.generate(
                this.systemPrompt,
                conversationMessages
            );


        /*
         * Save conversation only
         * after successful response.
         */
        nikaConversation.addUserMessage(
            userId,
            message
        );

        nikaConversation.addAssistantMessage(
            userId,
            answer
        );


        return answer;
    }


    async handle(bot, msg) {

        if (
            !msg ||
            !msg.from ||
            !msg.chat
        ) {
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
