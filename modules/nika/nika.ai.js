async generate(systemPrompt, conversationMessages) {

    if (
        !systemPrompt ||
        !String(systemPrompt).trim()
    ) {
        throw new Error(
            "Nika requires systemPrompt"
        );
    }

    if (
        !Array.isArray(conversationMessages) ||
        conversationMessages.length === 0
    ) {
        throw new Error(
            "Nika requires conversationMessages"
        );
    }

    const messages = [
        {
            role: "system",
            content: String(systemPrompt).trim()
        },
        ...conversationMessages
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
