const db = require("../../database/db");

class AiDaMemory {

    async load(userId) {
        const result = await db.query(
            `
            SELECT memory
            FROM user_memory
            WHERE telegram_id = $1
            `,
            [userId]
        );

        if (!result.rows.length) {
            return {};
        }

        return result.rows[0].memory || {};
    }

    async save(userId, memory) {
        await db.query(
            `
            INSERT INTO user_memory (telegram_id, memory)
            VALUES ($1, $2)
            ON CONFLICT (telegram_id)
            DO UPDATE SET
                memory = EXCLUDED.memory,
                updated_at = CURRENT_TIMESTAMP
            `,
            [userId, JSON.stringify(memory)]
        );

        return memory;
    }

    async remember(userId, key, value) {
        const memory = await this.load(userId);

        memory[key] = value;

        return await this.save(userId, memory);
    }

    async forget(userId, key) {
        const memory = await this.load(userId);

        delete memory[key];

        return await this.save(userId, memory);
    }
}

module.exports = new AiDaMemory();
