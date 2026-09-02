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
 * Long-term memory:
 *     ./nika.memory.js
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
const nikaMemory = require("./nika.memory");
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

    buildSystemPrompt(memory) {

        const memoryContext = JSON.stringify(
            memory || {},
            null,
            2
        );

        return [
            this.systemPrompt.trim(),
            "",
            "NIKA LONG-TERM MEMORY",
            "",
            "The following information is stored long-term for this user.",
            "Use it naturally when relevant.",
            "Do not invent facts that are not present in the memory.",
            "Do not reveal the internal memory structure to the user.",
            "",
            memoryContext
        ].join("\n");
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

        const memory =
            await nikaMemory.load(userId);

        const previousMessages =
            nikaConversation.getMessages(
                userId
            );

        const conversationMessages = [
            ...previousMessages,
            {
                role: "user",
                content: message
            }
        ];

        const systemPrompt =
            this.buildSystemPrompt(
                memory
            );

        const answer =
            await nikaAI.generate(
                systemPrompt,
                conversationMessages
            );

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
