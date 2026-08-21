const db = require("../../database/db");

class AiDaMemory {

    async load(userId) {

        const result = await db.query(
            `
            SELECT memory
            FROM user_memory
            WHERE user_id = $1
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
            INSERT INTO user_memory
                (user_id, memory)
            VALUES
                ($1, $2)
            ON CONFLICT (user_id)
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

        const memory =
            await this.load(userId);

        memory[key] = value;

        await this.save(
            userId,
            memory
        );

        return memory;
    }


    async forget(userId, key) {

        const memory =
            await this.load(userId);

        delete memory[key];

        await this.save(
            userId,
            memory
        );

        return memory;
    }
}


module.exports = new AiDaMemory();
