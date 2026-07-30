const { getAidaSystemPrompt } = require("./aida.system.prompt");

class PromptBuilder {

    constructor() {
        console.log("✅ PromptBuilder initialized");
    }

    build(messages) {
        console.log("🧠 Building prompt...");

        const systemPrompt = {
            role: "system",
            content: getAidaSystemPrompt()
        };

        return [
            systemPrompt,
            ...messages
        ];
    }

}

module.exports = PromptBuilder;
