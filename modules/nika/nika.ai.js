/**
 * SecretTalk
 * Nika v1.0
 *
 * AI Backend Adapter
 *
 * Architecture:
 *
 * Nika Runtime
 *      ↓
 * NikaAI
 *      ↓
 * OpenRouterClient
 *      ↓
 * Selected Nika Model
 *
 * Responsibility:
 * - keep Nika model configuration isolated;
 * - send prepared messages to the AI provider;
 * - validate the provider response;
 * - return only the generated assistant text.
 *
 * This module does NOT:
 * - define Nika's personality;
 * - determine relationship state;
 * - determine consent;
 * - determine interaction mode;
 * - determine initiative;
 * - implement safety policy;
 * - create or modify memories;
 * - decide what Nika should say.
 *
 * Those responsibilities belong to the Runtime,
 * Persona, Consent, Memory and Safety layers.
 */

const OpenRouterClient =
    require("../../ai/openrouter.client");


class NikaAI {

    constructor() {

        this.openRouter =
            new OpenRouterClient();


        /*
         * Nika has its own model configuration.
         *
         * This intentionally remains separate from
         * the global AI configuration.
         */

        this.model =
            process.env.NIKA_MODEL;


        if (!this.model) {

            throw new Error(
                "NIKA_MODEL is not configured"
            );
        }


        console.log(
            "✅ Nika AI initialized"
        );

        console.log(
            "🤖 Nika model:",
            this.model
        );
    }


    /**
     * Generate Nika response.
     *
     * systemPrompt:
     * Fully prepared system instructions produced
     * by Nika Runtime.
     *
     * conversationMessages:
     * Conversation context prepared by Runtime.
     *
     * This method does not modify either layer.
     */

    async generate(
        systemPrompt,
        conversationMessages
    ) {

        if (
            !systemPrompt ||
            !String(
                systemPrompt
            ).trim()
        ) {

            throw new Error(
                "Nika requires systemPrompt"
            );
        }


        if (
            !Array.isArray(
                conversationMessages
            )
        ) {

            throw new Error(
                "Nika requires conversationMessages"
            );
        }


        /*
         * A conversation may legitimately be empty
         * during an initial generation.
         *
         * The Runtime is responsible for deciding
         * whether generation should happen.
         */

        const messages = [

            {
                role: "system",

                content:
                    String(
                        systemPrompt
                    ).trim()
            },

            ...conversationMessages

        ];


        /*
         * Preserve the global OpenRouter model
         * before temporarily applying Nika's model.
         *
         * This prevents Nika from mutating global
         * AI configuration permanently.
         */

        const originalModel =
            this.openRouter.config.MODEL;


        this.openRouter.config.MODEL =
            this.model;


        try {

            const response =
                await this.openRouter.sendMessage(
                    messages
                );


            if (
                !response ||
                response.success !== true
            ) {

                throw new Error(
                    response?.error ||
                    "Nika AI provider request failed"
                );
            }


            const answer =
                response
                    ?.data
                    ?.choices?.[0]
                    ?.message
                    ?.content;


            if (
                typeof answer !== "string" ||
                !answer.trim()
            ) {

                throw new Error(
                    "Nika received an empty response from the model"
                );
            }


            return answer.trim();

        } finally {

            /*
             * Always restore the original model,
             * including when the provider throws.
             */

            this.openRouter.config.MODEL =
                originalModel;
        }
    }
}


/*
 * Singleton instance.
 *
 * nika.js already expects:
 *
 * const nikaAI = require("./nika.ai");
 *
 * Therefore the existing module contract
 * remains unchanged.
 */

module.exports =
    new NikaAI();
