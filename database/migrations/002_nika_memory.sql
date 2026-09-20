-- Nika long-term memory
-- Stores persistent facts, preferences, relationship notes
-- and important events separately from conversation history.

CREATE TABLE IF NOT EXISTS nika_memory (
    id BIGSERIAL PRIMARY KEY,

    telegram_id BIGINT NOT NULL,

    category TEXT NOT NULL
        CHECK (
            category IN (
                'facts',
                'preferences',
                'interactionPreferences',
                'relationshipNotes',
                'importantEvents'
            )
        ),

    value TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_nika_memory_user
ON nika_memory (telegram_id);

CREATE INDEX IF NOT EXISTS idx_nika_memory_user_category
ON nika_memory (telegram_id, category);

CREATE UNIQUE INDEX IF NOT EXISTS idx_nika_memory_unique
ON nika_memory (telegram_id, category, value);
