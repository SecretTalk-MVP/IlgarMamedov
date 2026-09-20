const db = require('../../database/db');

const MEMORY_CATEGORIES = Object.freeze([
    'facts',
    'preferences',
    'interactionPreferences',
    'relationshipNotes',
    'importantEvents'
]);

function validateCategory(category) {
    if (!MEMORY_CATEGORIES.includes(category)) {
        throw new Error(
            `Nika Memory: invalid category "${category}"`
        );
    }
}

async function getMemory(userId, category = null) {
    if (category !== null) {
        validateCategory(category);
    }

    const result = await db.query(
        `
        SELECT
            id,
            category,
            value,
            created_at,
            updated_at
        FROM nika_memory
        WHERE telegram_id = $1
        ${category !== null ? 'AND category = $2' : ''}
        ORDER BY updated_at DESC, id DESC
        `,
        category !== null
            ? [userId, category]
            : [userId]
    );

    return result.rows;
}

async function addMemory(
    userId,
    category,
    value
) {
    validateCategory(category);

    if (
        value === undefined ||
        value === null ||
        !String(value).trim()
    ) {
        throw new Error(
            'Nika Memory: value is required'
        );
    }

    const normalizedValue =
        String(value).trim();

    const result = await db.query(
        `
        INSERT INTO nika_memory (
            telegram_id,
            category,
            value,
            created_at,
            updated_at
        )
        VALUES (
            $1,
            $2,
            $3,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        )
        ON CONFLICT (
            telegram_id,
            category,
            value
        )
        DO UPDATE SET
            updated_at = CURRENT_TIMESTAMP
        RETURNING
            id,
            category,
            value,
            created_at,
            updated_at
        `,
        [
            userId,
            category,
            normalizedValue
        ]
    );

    return result.rows[0];
}

async function updateMemory(
    userId,
    memoryId,
    value
) {
    if (
        value === undefined ||
        value === null ||
        !String(value).trim()
    ) {
        throw new Error(
            'Nika Memory: value is required'
        );
    }

    const result = await db.query(
        `
        UPDATE nika_memory
        SET
            value = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND telegram_id = $2
        RETURNING
            id,
            category,
            value,
            created_at,
            updated_at
        `,
        [
            memoryId,
            userId,
            String(value).trim()
        ]
    );

    return result.rows[0] || null;
}

async function removeMemory(
    userId,
    memoryId
) {
    const result = await db.query(
        `
        DELETE FROM nika_memory
        WHERE id = $1
          AND telegram_id = $2
        RETURNING id
        `,
        [
            memoryId,
            userId
        ]
    );

    return result.rows[0] || null;
}

async function clearMemory(userId) {
    await db.query(
        `
        DELETE FROM nika_memory
        WHERE telegram_id = $1
        `,
        [userId]
    );
}

async function getMemorySnapshot(userId) {
    const rows =
        await getMemory(userId);

    const memory = {
        facts: [],
        preferences: [],
        interactionPreferences: [],
        relationshipNotes: [],
        importantEvents: []
    };

    for (const row of rows) {
        if (
            Array.isArray(memory[row.category])
        ) {
            memory[row.category].push({
                id: row.id,
                value: row.value,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            });
        }
    }

    return memory;
}

module.exports = {
    MEMORY_CATEGORIES,
    getMemory,
    addMemory,
    updateMemory,
    removeMemory,
    clearMemory,
    getMemorySnapshot
};
