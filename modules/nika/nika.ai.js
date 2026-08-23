/**
 * SecretTalk
 * Nika AI Backend
 *
 * Keeps Nika's model configuration separate from the global AI config.
 * The model is supplied by Railway: NIKA_MODEL.
 */

const OpenRouterClient = require("../../ai/openrouter.client");

class NikaAI {

    constructor() {

        this.openRouter = new OpenRouterClient();

        this.model = process.env.NIKA_MODEL;

        if (!this.model) {
            throw new Error("NIKA_MODEL is not configured");
        }

        console.log("✅ Nika AI initialized");
        console.log("🤖 Nika model:", this.model);
    }

    async generate(systemPrompt, userMessage) {

        const messages = [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: userMessage
            }
        ];

        const originalModel =
            this.openRouter.config.MODEL;

        this.openRouter.config.MODEL =
            this.model;

        try {

            const response =
                await this.openRouter.sendMessage(
                    messages
                );

            if (!response.success) {
                throw new Error(response.error);
            }

            const answer =
                response.data
                    ?.choices?.[0]
                    ?.message?.content;

            if (!answer) {
                throw new Error(
                    "Nika received an empty response from the model"
                );
            }

            return answer.trim();

        } finally {

            this.openRouter.config.MODEL =
                originalModel;
        }
    }
}

module.exports = new NikaAI();
