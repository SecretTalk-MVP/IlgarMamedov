const fs = require("fs");
const path = require("path");

class PromptBuilder {

    constructor() {

        this.aidaSystemPrompt = fs.readFileSync(
            path.join(
                __dirname,
                "..",
                "ai_characters",
                "aida.system.md"
            ),
            "utf8"
        );

        console.log(
            "✅ PromptBuilder initialized"
        );
    }

    build(messages) {

        console.log(
            "🧠 Building prompt..."
        );

        const systemPrompt = {
            role: "system",
            content: this.aidaSystemPrompt
        };

        return [
            systemPrompt,
            ...messages
        ];
    }

}

module.exports = PromptBuilder;
