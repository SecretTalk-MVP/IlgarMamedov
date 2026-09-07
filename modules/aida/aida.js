/**
 * SecretTalk
 * AiDa Module
 *
 * AiDa is completely self-contained here.
 *
 * Character:
 *     ./aida.system.md
 *
 * Conversation History:
 *     PostgreSQL -> aida_messages
 *
 * Router remains outside this module.
 */

const fs = require("fs");
const path = require("path");

const OpenRouterClient = require("../../ai/openrouter.client");
const db = require("../../database/db");

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


    async loadConversationHistory(userId) {

        if (!userId) {
            throw new Error("AiDa requires userId");
        }

        const result = await db.query(`
            SELECT role, content
            FROM aida_messages
            WHERE telegram_id = $1
            ORDER BY id DESC
            LIMIT 6
        `, [userId]);

        /*
         * Restore chronological order.
         */
        return result.rows.reverse();
    }


    async saveMessage(userId, role, content) {

        if (!userId) {
            throw new Error("AiDa requires userId");
        }

        if (!role || !["user", "assistant"].includes(role)) {
            throw new Error("AiDa requires valid message role");
        }

        if (!content || !String(content).trim()) {
            throw new Error("AiDa requires message content");
        }

        await db.query(`
            INSERT INTO aida_messages (
                telegram_id,
                role,
                content
            )
            VALUES ($1, $2, $3)
        `, [
            userId,
            role,
            String(content).trim()
        ]);
    }


    async ask(userId, userMessage) {

        if (!userId) {
            throw new Error("AiDa requires userId");
        }

        if (!userMessage || !String(userMessage).trim()) {
            throw new Error("AiDa requires userMessage");
        }

        const text = String(userMessage).trim();


        /*
         * Load recent conversation history.
         *
         * Long-term memory is intentionally NOT used.
         */
        const conversationHistory =
            await this.loadConversationHistory(userId);


        /*
         * Build model context.
         *
         * Order:
         * 1. Character identity
         * 2. Recent conversation history
         * 3. Current user message
         */
        const messages = [
            {
                role: "system",
                content: this.systemPrompt.trim()
            },

            ...conversationHistory,

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
            "History messages:",
            conversationHistory.length
        );
        console.log(
            "Total messages:",
            messages.length
        );


        /*
         * Send context to OpenRouter.
         */
        const response =
            await this.openRouter.sendMessage(messages);


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

        const trimmedAnswer = answer.trim();


        /*
         * Persist the actual conversation only
         * after a successful model response.
         */
        await this.saveMessage(
            userId,
            "user",
            text
        );

        await this.saveMessage(
            userId,
            "assistant",
            trimmedAnswer
        );


        return trimmedAnswer;
    }


    async handle(bot, msg) {

        const userId = msg.from.id;
        const text = msg.text;

        if (!text) {
            return false;
        }

        const answer =
            await this.ask(userId, text);

        await bot.sendMessage(
            msg.chat.id,
            answer
        );

        return true;
    }
}


module.exports = new AiDa();
