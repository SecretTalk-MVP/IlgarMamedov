const db = require("../../database/db");

class Verification {

    async isVerified(userId) {
        if (!userId) {
            throw new Error("Verification requires userId");
        }

        const result = await db.query(
            `
            SELECT verified
            FROM users
            WHERE telegram_id = $1
            `,
            [userId]
        );

        if (!result.rows.length) {
            return false;
        }

        return result.rows[0].verified === true;
    }

    async setVerified(userId, value = true) {
        if (!userId) {
            throw new Error("Verification requires userId");
        }

        await db.query(
            `
            UPDATE users
            SET verified = $2
            WHERE telegram_id = $1
            `,
            [userId, Boolean(value)]
        );

        return Boolean(value);
    }
}

module.exports = new Verification();
