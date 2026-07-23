const AI_CONFIG = require("./ai.config");
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

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
            const response = await fetch(OPENROUTER_URL, {

    method: "POST",

    headers: {

        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,

        "Content-Type": "application/json"

    },

    body: JSON.stringify(body)

});

const result = await response.json();

    return {

        success: true,

        data: result,

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
