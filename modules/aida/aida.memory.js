const db = require("../../database/db");

class AiDaMemory {

    async load(userId) {

        if (!userId) {
            throw new Error(
                "AiDaMemory requires userId"
            );
        }

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

        if (!userId) {
            throw new Error(
                "AiDaMemory requires userId"
            );
        }

        if (
            !memory ||
            typeof memory !== "object" ||
            Array.isArray(memory)
        ) {
            throw new Error(
                "AiDaMemory requires memory object"
            );
        }

        await db.query(
            `
            INSERT INTO user_memory (
                telegram_id,
                memory
            )
            VALUES ($1, $2)
            ON CONFLICT (telegram_id)
            DO UPDATE SET
                memory = EXCLUDED.memory,
                updated_at = CURRENT_TIMESTAMP
            `,
            [
                userId,
                JSON.stringify(memory)
            ]
        );

        return memory;
    }


    async remember(userId, key, value) {

        if (!userId) {
            throw new Error(
                "AiDaMemory requires userId"
            );
        }

        if (!key || !String(key).trim()) {
            throw new Error(
                "AiDaMemory requires key"
            );
        }

        const memory =
            await this.load(userId);

        memory[String(key).trim()] = value;

        return await this.save(
            userId,
            memory
        );
    }


    async forget(userId, key) {

        if (!userId) {
            throw new Error(
                "AiDaMemory requires userId"
            );
        }

        if (!key || !String(key).trim()) {
            throw new Error(
                "AiDaMemory requires key"
            );
        }

        const memory =
            await this.load(userId);

        delete memory[String(key).trim()];

        return await this.save(
            userId,
            memory
        );
    }
}


module.exports = new AiDaMemory();
