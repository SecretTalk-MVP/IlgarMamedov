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

        this.openRouterClient = new OpenRouterClient();

        this.isInitialized = true;

    }

    async ask(messages) {

        if (!this.isInitialized) {

            throw new Error("AIService is not initialized");

        }

        const response = await this.openRouterClient.sendMessage(messages);
        this.stats.requests++;

console.log("AI response received");

return response;

    }

    async chat(messages) {

        return await this.ask(messages);

    }

}

module.exports = AIService;
