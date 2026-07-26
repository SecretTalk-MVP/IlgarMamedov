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
        const MemoryService = require("../memory/memory.service");
        const MemoryEngine = require("../memory/memory.engine");

        this.openRouterClient = new OpenRouterClient();
        this.promptBuilder = new PromptBuilder();
        this.contextBuilder = new ContextBuilder();
        this.memoryService = new MemoryService();
        this.memoryEngine = new MemoryEngine();

        this.isInitialized = true;

    }

    async ask(userId, messages) {

        const context = await this.contextBuilder.build(userId, messages);

        const prompt = this.promptBuilder.build(context);

        if (!this.isInitialized) {
            throw new Error("AIService is not initialized");
        }

        const response = await this.openRouterClient.sendMessage(prompt);
        if (!response.success) {
            throw new Error(response.error);
        }
        const aiAnswer = response.data.choices[0].message.content;

let memory = await this.memoryService.loadMemory(userId);

const userMessage = messages[messages.length - 1].content;

memory = this.memoryEngine.analyze(
    memory,
    userMessage,
    aiAnswer
);

await this.memoryService.saveMemory(
    userId,
    memory
);

        this.stats.requests++;

        console.log("AI response received");

        return aiAnswer;
    }

    async chat(userId, messages) {

        return await this.ask(userId, messages);

    }

}

module.exports = AIService;
