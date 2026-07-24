class PromptBuilder {

    constructor() {

        console.log("✅ PromptBuilder initialized");

    }

    build(messages) {
            console.log("🧠 Building prompt...");
        const systemPrompt = {
    role: "system",
    content: "You are SecretTalk AI."
};

        return [
    systemPrompt,
    ...messages
];

    }

}

module.exports = PromptBuilder;
