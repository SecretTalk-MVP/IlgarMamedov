const AI_CONFIG = require("./ai.config");

class OpenRouterClient {

    constructor() {

    this.config = AI_CONFIG;

    console.log("✅ OpenRouterClient initialized");

    }
    async sendMessage(messages) {

    console.log("📨 Sending request to OpenRouter...");

    console.log("Model:", this.config.MODEL);

    console.log("Messages:", messages.length);

    return {
        success: false,
        data: null,
        error: null
    };

}

module.exports = OpenRouterClient;
