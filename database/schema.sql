-- SecretTalk Database Schema

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    gender TEXT,
    age INTEGER,
    city TEXT,
    goal TEXT,
    verified BOOLEAN DEFAULT FALSE,
    premium BOOLEAN DEFAULT FALSE,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dialogs (
    id SERIAL PRIMARY KEY,
    user1 BIGINT NOT NULL,
    user2 BIGINT NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    dialog_id INTEGER,
    sender BIGINT NOT NULL,
    message_type TEXT DEFAULT 'text',
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS aida_messages (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    role TEXT NOT NULL
        CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_aida_messages_user_time
ON aida_messages (telegram_id, created_at);
CREATE TABLE IF NOT EXISTS nika_runtime_state (
    telegram_id BIGINT PRIMARY KEY,
    relationship_state TEXT DEFAULT 'NEW',
    consent_state TEXT DEFAULT 'UNKNOWN',
    interaction_mode TEXT DEFAULT 'NEUTRAL',
    adult_verified BOOLEAN DEFAULT FALSE,
    last_initiative_action TEXT,
    last_activity_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_nika_runtime_state_updated
ON nika_runtime_state (updated_at);
