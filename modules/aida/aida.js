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


        /*
         * Remember explicit user information.
         *
         * The memory module is responsible for
         * persistent storage.
         */
        await this.rememberExplicitFacts(
            userId,
            userMessage
        );


        return answer.trim();
    }


    async rememberExplicitFacts(userId, text) {

        const value = String(text).trim();

        /*
         * Name
         */
        const nameMatch = value.match(
            /(?:меня зовут|моё имя|мое имя)\s+(.+)/i
        );

        if (nameMatch) {

            const name = nameMatch[1]
                .trim()
                .replace(/[.!?]+$/, "");

            if (name) {

                await memory.remember(
                    userId,
                    "name",
                    name
                );

            }
        }


        /*
         * Favourite colour.
         *
         * Example:
         * "Мой любимый цвет — синий."
         */
        const colorMatch = value.match(
            /(?:мой|моя)\s+любим(?:ый|ая)\s+цвет\s*(?:-|—|–|:)?\s*(.+)/i
        );

        if (colorMatch) {

            const color = colorMatch[1]
                .trim()
                .replace(/[.!?]+$/, "");

            if (color) {

                await memory.remember(
                    userId,
                    "favorite_color",
                    color
                );

            }
        }
    }
}


module.exports = new AiDa();
