/**
 * SecretTalk
 * AiDa Module
 *
 * AiDa is completely self-contained here.
 *
 * Character:
 *     ./aida.system.md
 *
 * Memory:
 *     ./aida.memory.js
 *
 * Router remains outside this module.
 */

const fs = require("fs");
const path = require("path");

const OpenRouterClient = require("../../ai/openrouter.client");
const memory = require("./aida.memory");

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
        console.log("🧠 AiDa character:", this.systemPromptPath);

    }


    async ask(userId, userMessage) {

        if (!userId) {
            throw new Error("AiDa requires userId");
        }

        if (!userMessage || !String(userMessage).trim()) {
            throw new Error("AiDa requires userMessage");
        }

        /*
         * Load long-term memory.
         */
        const userMemory = await memory.load(userId);


        /*
         * Build the system message.
         *
         * IMPORTANT:
         * AiDa's personality comes ONLY from
         * aida.system.md.
         *
         * Memory is additional information
         * about the user and never replaces
         * the character.
         */
        const memoryText = JSON.stringify(
            userMemory || {},
            null,
            2
        );

        const systemMessage = [
            this.systemPrompt.trim(),

            "",
            "---",
            "LONG-TERM MEMORY",
            "---",
            "The following information was previously saved about the user.",
            "Use it naturally when relevant.",
            "Do not invent information that is not present here.",
            "Do not mention the internal memory system.",
            "",
            memoryText
        ].join("\n");


        /*
         * Send the conversation directly
         * to OpenRouter.
         *
         * We intentionally do NOT use:
         * - AIService
         * - PromptBuilder
         * - ContextBuilder
         * - old MemoryEngine
         *
         * This keeps AiDa independent.
         */
        const response = await this.openRouter.sendMessage([
            {
                role: "system",
                content: systemMessage
            },
            {
                role: "user",
                content: String(userMessage).trim()
            }
        ]);


        if (!response.success) {
            throw new Error(response.error);
        }


        const answer =
            response.data?.choices?.[0]?.message?.content;


        if (!answer) {
            throw new Error(
                "AiDa received an empty response from the model"
            );
        }
        
return answer.trim();
    
    }
    async handle(bot, msg) {
    const userId = msg.from.id;
    const text = msg.text;

    if (!text) {
        return false;
    }

    const answer = await this.ask(userId, text);

    await bot.sendMessage(
        msg.chat.id,
        answer
    );

    return true;
    }
}

module.exports = new AiDa();
