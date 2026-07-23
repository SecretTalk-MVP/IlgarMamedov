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
        try {

    const body = await this.createRequestBody(messages);

    console.log("Request body created");

    return {

        success: true,

        data: body,

        error: null

    };

} catch (error) {

    console.error(error);

    return {

        success: false,

        data: null,

        error: error.message

    };

        }

    async createRequestBody(messages) {

    return {

        model: this.config.MODEL,

        messages,

        temperature: this.config.TEMPERATURE,

        max_tokens: this.config.MAX_TOKENS,

        top_p: this.config.TOP_P,

        presence_penalty: this.config.PRESENCE_PENALTY,

        frequency_penalty: this.config.FREQUENCY_PENALTY

    };

}

}

module.exports = OpenRouterClient;
