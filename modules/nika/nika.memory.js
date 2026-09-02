/**
 * SecretTalk
 * Nika Memory
 *
 * Long-term memory for Nika.
 *
 * Storage:
 *     PostgreSQL -> user_memory
 *
 * Nika memory is stored inside:
 *
 *     memory.nika
 *
 * This prevents Nika from overwriting
 * memory belonging to AiDa or other modules.
 *
 * This module is independent from:
 *     - AiDa
 *     - Nika conversation history
 *     - Router
 *     - Telegram
 *     - AI provider
 */

const db = require("../../database/db");

class NikaMemory {
    async load(userId) {
        if (!userId) {
            throw new Error("NikaMemory requires userId");
        }

        const result = await db.query(`
            SELECT memory
            FROM user_memory
            WHERE telegram_id = $1
        `, [userId]);

        if (!result.rows.length) {
            return {};
        }

        const fullMemory = result.rows[0].memory || {};

        return fullMemory.nika || {};
    }

    async save(userId, nikaMemory) {
        if (!userId) {
            throw new Error("NikaMemory requires userId");
        }

        if (
            !nikaMemory ||
            typeof nikaMemory !== "object" ||
            Array.isArray(nikaMemory)
        ) {
            throw new Error("NikaMemory requires memory object");
        }

        const result = await db.query(`
            SELECT memory
            FROM user_memory
            WHERE telegram_id = $1
        `, [userId]);

        const fullMemory = result.rows.length
            ? (result.rows[0].memory || {})
            : {};

        const updatedMemory = {
            ...fullMemory,
            nika: nikaMemory
        };

        await db.query(`
            INSERT INTO user_memory (
                telegram_id,
                memory
            )
            VALUES ($1, $2)
            ON CONFLICT (telegram_id)
            DO UPDATE SET
                memory = EXCLUDED.memory,
                updated_at = CURRENT_TIMESTAMP
        `, [
            userId,
            JSON.stringify(updatedMemory)
        ]);

        return nikaMemory;
    }

    async remember(userId, key, value) {
        if (!userId) {
            throw new Error("NikaMemory requires userId");
        }

        if (!key || !String(key).trim()) {
            throw new Error("NikaMemory requires key");
        }

        const memory = await this.load(userId);

        memory[String(key).trim()] = value;

        return await this.save(userId, memory);
    }

    async forget(userId, key) {
        if (!userId) {
            throw new Error("NikaMemory requires userId");
        }

        if (!key || !String(key).trim()) {
            throw new Error("NikaMemory requires key");
        }

        const memory = await this.load(userId);

        delete memory[String(key).trim()];

        return await this.save(userId, memory);
    }
}

module.exports = new NikaMemory();
