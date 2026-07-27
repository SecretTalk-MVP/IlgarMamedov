const MemoryService = require("../memory/memory.service");

class ContextBuilder {

    constructor() {

        console.log("✅ ContextBuilder initialized");

        this.memoryService = new MemoryService();

    }

    async build(userId, messages) {

        console.log("🧠 Building context...");

        const memory = await this.memoryService.loadMemory(userId);

        console.log("Memory loaded:", memory.profile?.name);

        const context = [];

        if (memory.profile?.name) {
            context.push({
                role: "system",
                content: `
Long-term memory.

User name: ${memory.profile.name}

Use this information in all future answers.
Do not ask again if you already know it.
`
            });
        }

        context.push(...messages);

        return context;

    }

}

module.exports = ContextBuilder;
