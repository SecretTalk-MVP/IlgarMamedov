/**
 * SecretTalk
 * AiDa Module
 *
 * AiDa is completely self-contained here.
 *
 * Character:
 *     ./aida.system.md
 *
 * Conversation:
 *     Current message only.
 *
 * Long-term memory:
 *     Disabled.
 *
 * Database:
 *     Not used by AiDa.
 *
 * Router remains outside this module.
 */

const fs = require("fs");
const path = require("path");

const OpenRouterClient = require("../../ai/openrouter.client");

class AiDa {

    constructor() {

        this.name = "AiDa";

        this.systemPromptPath = path.join(
            __dirname,
            "aida.system.md"
        );

        this.systemPrompt = fs.readFileSync(
            this.systemPromptPath,
            "utf-8"
        );

        this.openRouter = new OpenRouterClient();

        console.log("✅ AiDa initialized");
        console.log(
            "🧠 AiDa character:",
            this.systemPromptPath
        );
        console.log(
            "🧹 AiDa long-term memory: disabled"
        );
        console.log(
            "🧹 AiDa conversation history: disabled"
        );
    }


    async ask(userId, userMessage) {

        if (!userId) {
            throw new Error(
                "AiDa requires userId"
            );
        }

        if (
            !userMessage ||
            !String(userMessage).trim()
        ) {
            throw new Error(
                "AiDa requires userMessage"
            );
        }

        const text =
            String(userMessage).trim();


        /*
         * AiDa intentionally uses only:
         *
         * 1. Character system prompt
         * 2. Current user message
         *
         * No long-term memory.
         * No conversation history.
         * No PostgreSQL.
         */
        const messages = [
            {
                role: "system",
                content: this.systemPrompt.trim()
            },
            {
                role: "user",
                content: text
            }
        ];


        console.log("🧠 AiDa context:");
        console.log(
            "System prompt:",
            this.systemPrompt.length,
            "chars"
        );
        console.log(
            "History messages: 0"
        );
        console.log(
            "Total messages:",
            messages.length
        );


        /*
         * Send only the current context
         * to OpenRouter.
         */
        const response =
            await this.openRouter.sendMessage(
                messages
            );


        if (!response.success) {
            throw new Error(
                response.error
            );
        }


        const answer =
            response.data
                ?.choices?.[0]
                ?.message?.content;


        if (!answer) {
            throw new Error(
                "AiDa received an empty response from the model"
            );
        }


        return answer.trim();
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

        const userId =
            msg.from.id;

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


module.exports = new AiDa();
