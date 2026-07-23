class AIService {

    constructor() {

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

        return await this.openRouterClient.sendMessage(messages);

    }

    async chat(messages) {

        return await this.ask(messages);

    }

}

module.exports = AIService;
