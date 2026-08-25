/**
 * SecretTalk
 * Unified Memory Module
 *
 * Memory belongs to the user, not to a character.
 *
 * This module is intentionally independent.
 * It is NOT connected to Nika, AiDa or index.js yet.
 */

class Memory {

    constructor() {

        console.log("🧠 Unified Memory initialized");

    }


    createEmpty() {

        return {

            profile: {
                name: null,
                gender: null,
                age: null,
                country: null,
                city: null,
                language: null
            },

            preferences: {},

            conversation: {
                lastTopic: null,
                lastInteraction: null
            },

            relationship: {
                trustLevel: 0,
                notes: [],
                promises: []
            }

        };

    }


    normalize(memory) {

        const base = this.createEmpty();

        if (!memory || typeof memory !== "object") {
            return base;
        }

        return {

            ...base,
            ...memory,

            profile: {
                ...base.profile,
                ...(memory.profile || {})
            },

            preferences: {
                ...base.preferences,
                ...(memory.preferences || {})
            },

            conversation: {
                ...base.conversation,
                ...(memory.conversation || {})
            },

            relationship: {
                ...base.relationship,
                ...(memory.relationship || {})
            }

        };

    }


    update(memory, userMessage) {

        const result = this.normalize(memory);

        if (
            !userMessage ||
            !String(userMessage).trim()
        ) {
            return result;
        }

        const message = String(userMessage).trim();
        const lower = message.toLowerCase();


        /*
         * Profile: name
         */

        const nameMatch = lower.match(
            /(?:меня зовут|моё имя|мое имя)\s+(.+)/i
        );

        if (nameMatch) {

            result.profile.name =
                message
                    .substring(
                        message.toLowerCase()
                            .indexOf(nameMatch[0].toLowerCase())
                        + nameMatch[0].length
                    )
                    .trim();

        }


        /*
         * Profile: language
         */

        if (
            lower.includes("я говорю по-русски") ||
            lower.includes("я говорю на русском")
        ) {
            result.profile.language = "ru";
        }


        if (
            lower.includes("я говорю на азербайджанском")
        ) {
            result.profile.language = "az";
        }


        if (
            lower.includes("я говорю на турецком")
        ) {
            result.profile.language = "tr";
        }


        if (
            lower.includes("i speak english")
        ) {
            result.profile.language = "en";
        }


        /*
         * Conversation metadata.
         */

        result.conversation.lastInteraction =
            new Date().toISOString();


        return result;

    }


    getRelevant(memory, keys = null) {

        const normalized =
            this.normalize(memory);

        if (!keys) {
            return normalized;
        }

        const result = {};

        for (const key of keys) {

            if (key in normalized) {
                result[key] = normalized[key];
            }

        }

        return result;

    }

}


module.exports = new Memory();
