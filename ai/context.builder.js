const MemoryService = require("../memory/memory.service");

class ContextBuilder {

    constructor() {

        console.log("✅ ContextBuilder initialized");

        this.memoryService = new MemoryService();

    }

    build(messages) {

        console.log("🧠 Building context...");

        return messages;

    }

}

module.exports = ContextBuilder;
