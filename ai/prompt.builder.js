class PromptBuilder {

    constructor() {

        console.log(
            "⚠️ AiDa system prompt temporarily disabled for diagnostic test"
        );
    }

    build(messages) {

        console.log(
            "🧪 Building prompt WITHOUT AiDa system prompt..."
        );

        return [
            ...messages
        ];
    }

}

module.exports = PromptBuilder;
