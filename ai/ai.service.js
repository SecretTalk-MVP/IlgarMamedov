class AIService {

    constructor() {

        this.stats = {
            requests: 0,
            errors: 0
        };

        this.openRouterClient = null;
        this.isInitialized = false;

        console.log("✅ AIService initialized");

        const OpenRouterClient = require("./openrouter.client");
        const PromptBuilder = require("./prompt.builder");
        const ContextBuilder = require("./context.builder");

        this.openRouterClient = new OpenRouterClient();
        this.promptBuilder = new PromptBuilder();
        this.contextBuilder = new ContextBuilder();

        this.isInitialized = true;

    }

    async ask(userId, messages) {

        const context = await this.contextBuilder.build(userId, messages);

        const prompt = this.promptBuilder.build(context);

        if (!this.isInitialized) {
            throw new Error("AIService is not initialized");
        }

        const response = await this.openRouterClient.sendMessage(prompt);

        this.stats.requests++;

        console.log("AI response received");

        if (!response.success) {
            throw new Error(response.error);
        }

        return response.data.choices[0].message.content;

    }

    async chat(userId, messages) {

        return await this.ask(userId, messages);

    }

}

module.exports = AIService;
