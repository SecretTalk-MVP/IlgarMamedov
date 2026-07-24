const { getEskoSystemPrompt } = require("./esko.system.prompt");

class PromptBuilder {

    constructor() {
        console.log("✅ PromptBuilder initialized");
    }

    build(messages) {
        console.log("🧠 Building prompt...");

        const systemPrompt = {
            role: "system",
            content: getEskoSystemPrompt()
        };

        return [
            systemPrompt,
            ...messages
        ];
    }

}

module.exports = PromptBuilder;
