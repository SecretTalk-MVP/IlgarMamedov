const crypto = require("crypto");
const db = require("../../database/db");

const SESSION_TTL_MINUTES = 5;

const COLORS = [
    "СИНИЙ",
    "КРАСНЫЙ",
    "ЗЕЛЁНЫЙ",
    "ЖЁЛТЫЙ",
    "БЕЛЫЙ",
    "ЧЁРНЫЙ"
];

const NOUNS = [
    "ЛИМОН",
    "АПЕЛЬСИН",
    "ЯБЛОКО",
    "КОТ",
    "ДОМ",
    "МОРЕ"
];

function randomItem(items) {
    return items[
        crypto.randomInt(0, items.length)
    ];
}

function generateChallengePhrase() {
    return `${randomItem(COLORS)} ${randomItem(NOUNS)}`;
}

async function createSession(userId) {
    if (!userId) {
        throw new Error("Verification session requires userId");
    }

    await db.query(
        `
        UPDATE verification_sessions
        SET status = 'expired'
        WHERE telegram_id = $1
          AND status = 'pending'
          AND expires_at <= CURRENT_TIMESTAMP
        `,
        [userId]
    );

    await db.query(
        `
        UPDATE verification_sessions
        SET status = 'failed'
        WHERE telegram_id = $1
          AND status = 'pending'
        `,
        [userId]
    );

    const challengePhrase =
        generateChallengePhrase();

    const result =
        await db.query(
            `
            INSERT INTO verification_sessions (
                telegram_id,
                challenge_phrase,
                status,
                expires_at
            )
            VALUES (
                $1,
                $2,
                'pending',
                CURRENT_TIMESTAMP + INTERVAL '${SESSION_TTL_MINUTES} minutes'
            )
            RETURNING
                id,
                telegram_id,
                challenge_phrase,
                status,
                created_at,
                expires_at
            `,
            [
                userId,
                challengePhrase
            ]
        );

    return result.rows[0];
}

async function getActiveSession(userId) {
    if (!userId) {
        throw new Error("Verification session requires userId");
    }

    const result =
        await db.query(
            `
            SELECT
                id,
                telegram_id,
                challenge_phrase,
                status,
                created_at,
                expires_at,
                verified_at
            FROM verification_sessions
            WHERE telegram_id = $1
              AND status = 'pending'
              AND expires_at > CURRENT_TIMESTAMP
            ORDER BY created_at DESC
            LIMIT 1
            `,
            [userId]
        );

    if (!result.rows.length) {
        return null;
    }

    return result.rows[0];
}

async function markVerified(sessionId) {
    if (!sessionId) {
        throw new Error("Verification session requires sessionId");
    }

    const result =
        await db.query(
            `
            UPDATE verification_sessions
            SET
                status = 'verified',
                verified_at = CURRENT_TIMESTAMP
            WHERE id = $1
              AND status = 'pending'
              AND expires_at > CURRENT_TIMESTAMP
            RETURNING
                id,
                telegram_id,
                challenge_phrase,
                status,
                created_at,
                expires_at,
                verified_at
            `,
            [sessionId]
        );

    if (!result.rows.length) {
        return null;
    }

    return result.rows[0];
}

async function markFailed(sessionId) {
    if (!sessionId) {
        throw new Error("Verification session requires sessionId");
    }

    const result =
        await db.query(
            `
            UPDATE verification_sessions
            SET status = 'failed'
            WHERE id = $1
              AND status = 'pending'
            RETURNING
                id,
                telegram_id,
                challenge_phrase,
                status,
                created_at,
                expires_at,
                verified_at
            `,
            [sessionId]
        );

    if (!result.rows.length) {
        return null;
    }

    return result.rows[0];
}

module.exports = {
    SESSION_TTL_MINUTES,
    generateChallengePhrase,
    createSession,
    getActiveSession,
    markVerified,
    markFailed
};
