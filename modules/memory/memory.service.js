cat > memory.service.js <<'EOF'
const MemoryStore = require("./memory.store");
const memory = require("./memory");

class MemoryService {
    constructor() {
        this.store = new MemoryStore();
    }

    async load(telegramId) {
        const saved = await this.store.load(telegramId);

        if (!saved) {
            return memory.createEmpty();
        }

        return memory.normalize(saved);
    }

    async update(telegramId, userMessage) {
        const current = await this.load(telegramId);
        const updated = memory.update(current, userMessage);

        await this.store.save(telegramId, updated);

        return updated;
    }
}

module.exports = MemoryService;
EOF
