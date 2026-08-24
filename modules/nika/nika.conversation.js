/**
 * SecretTalk
 * Nika Conversation
 *
 * Responsible only for short-term conversation history.
 *
 * No AI.
 * No Telegram.
 * No Router.
 * No verification.
 * No database.
 *
 * This module keeps the current conversation context
 * for each user and prepares messages for the AI.
 */

class NikaConversation {

    constructor() {

        this.conversations = new Map();

        // Максимальное количество сообщений,
        // которое Ника держит в краткосрочном контексте.
        this.maxMessages = 20;

        console.log(
            "✅ Nika Conversation initialized"
        );
    }


    /*
     * =========================================================
     * GET CONVERSATION
     * =========================================================
     */

    get(userId) {

        if (!userId) {
            throw new Error(
                "NikaConversation requires userId"
            );
        }

        if (!this.conversations.has(userId)) {

            this.conversations.set(
                userId,
                []
            );
        }

        return this.conversations.get(userId);
    }


    /*
     * =========================================================
     * ADD USER MESSAGE
     * =========================================================
     */

    addUserMessage(
        userId,
        message
    ) {

        if (!message || !String(message).trim()) {
            return;
        }

        const conversation =
            this.get(userId);

        conversation.push({
            role: "user",
            content: String(message).trim()
        });

        this.trim(userId);
    }


    /*
     * =========================================================
     * ADD NIKA MESSAGE
     * =========================================================
     */

    addAssistantMessage(
        userId,
        message
    ) {

        if (!message || !String(message).trim()) {
            return;
        }

        const conversation =
            this.get(userId);

        conversation.push({
            role: "assistant",
            content: String(message).trim()
        });

        this.trim(userId);
    }


    /*
     * =========================================================
     * GET MESSAGES
     * =========================================================
     */

    getMessages(userId) {

        return [
            ...this.get(userId)
        ];
    }


    /*
     * =========================================================
     * TRIM
     * =========================================================
     *
     * Не даём краткосрочной памяти
     * бесконечно расти.
     */

    trim(userId) {

        const conversation =
            this.get(userId);

        if (
            conversation.length >
            this.maxMessages
        ) {

            conversation.splice(
                0,
                conversation.length -
                this.maxMessages
            );
        }
    }


    /*
     * =========================================================
     * RESET
     * =========================================================
     */

    reset(userId) {

        if (!userId) {
            throw new Error(
                "NikaConversation requires userId"
            );
        }

        this.conversations.set(
            userId,
            []
        );
    }


    /*
     * =========================================================
     * REMOVE
     * =========================================================
     */

    remove(userId) {

        this.conversations.delete(
            userId
        );
    }
}


module.exports =
    new NikaConversation();
