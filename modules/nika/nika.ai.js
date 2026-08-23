/**
 * SecretTalk
 * Nika AI Backend
 *
 * Independent AI layer for Nika.
 *
 * This module deliberately does not use:
 * - AiDa AI implementation
 * - AIService
 * - PromptBuilder
 * - ContextBuilder
 */

const OpenRouterClient = require("../../ai/openrouter.client");

class NikaAI {

    constructor() {

        this.model =
            process.env.NIKA_MODEL ||
            "openai/gpt-5.6";

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
                messages,
                {
                    model: this.model,
                    temperature: this.temperature,
                    max_tokens: this.maxTokens
                }
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
