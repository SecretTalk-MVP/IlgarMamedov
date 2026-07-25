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

        return messages;

    }

}

module.exports = ContextBuilder;
