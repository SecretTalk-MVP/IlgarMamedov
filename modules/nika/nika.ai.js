/**
 * SecretTalk
 * Nika AI Backend
 *
 * Independent AI layer for Nika.
 *
 * Nika does not modify the shared OpenRouterClient.
 * Nika uses its own model configuration.
 */

const OpenRouterClient = require("../../ai/openrouter.client");

class NikaAI {

    constructor() {

        this.model =
            process.env.NIKA_MODEL;

        if (!this.model) {
            throw new Error(
                "NIKA_MODEL environment variable is required"
            );
        }

        this.temperature =
            Number(
                process.env.NIKA_TEMPERATURE || 1.0
            );

        this.maxTokens =
            Number(
                process.env.NIKA_MAX_TOKENS || 1200
            );

        this.client =
            new OpenRouterClient();

        this.client.config = {
            ...this.client.config,

            MODEL: this.model,
            TEMPERATURE: this.temperature,
            MAX_TOKENS: this.maxTokens
        };

        console.log("✅ Nika AI initialized");
        console.log(
            "🤖 Nika model:",
            this.model
        );
    }

    async generate(
        systemPrompt,
        userMessage,
        context = []
    ) {

        if (!systemPrompt) {
            throw new Error(
                "NikaAI requires systemPrompt"
            );
        }

        if (
            !userMessage ||
            !String(userMessage).trim()
        ) {
            throw new Error(
                "NikaAI requires userMessage"
            );
        }

        const messages = [
            {
                role: "system",
                content: systemPrompt
            },

            ...context,

            {
                role: "user",
                content: String(
                    userMessage
                ).trim()
            }
        ];

        const response =
            await this.client.sendMessage(
                messages
            );

        if (!response.success) {
            throw new Error(
                response.error ||
                "Nika AI request failed"
            );
        }

        const answer =
            response.data
                ?.choices?.[0]
                ?.message
                ?.content;

        if (!answer) {
            throw new Error(
                "Nika AI returned empty response"
            );
        }

        return answer.trim();
    }
}

module.exports = new NikaAI();
