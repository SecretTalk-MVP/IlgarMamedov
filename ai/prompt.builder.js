class PromptBuilder {

    constructor() {

        console.log("✅ PromptBuilder initialized");

    }

    build(messages) {
            console.log("🧠 Building prompt...");
        const systemPrompt = {
    role: "system",
    content: "You are Esko, the AI core of SecretTalk."
};

        return [
    systemPrompt,
    ...messages
];

    }

}

module.exports = PromptBuilder;
