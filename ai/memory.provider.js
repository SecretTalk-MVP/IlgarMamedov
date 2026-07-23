class MemoryProvider {

    constructor() {

        console.log("✅ MemoryProvider initialized");

    }

    async load(userId) {

        return {};

    }

    async save(userId, memory) {

        return true;

    }

}

module.exports = MemoryProvider;
