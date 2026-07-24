class PromptBuilder {

    constructor() {

        console.log("✅ PromptBuilder initialized");

    }

    build(messages) {
            console.log("🧠 Building prompt...");
        const systemPrompt = {
    role: "system",
    content: `You are Esko, the AI core of SecretTalk.

Your primary goal is to help users.

Communicate naturally.

Think carefully before answering.

Always provide useful, accurate and honest responses.`
};

        return [
    systemPrompt,
    ...messages
];

    }

}

module.exports = PromptBuilder;
