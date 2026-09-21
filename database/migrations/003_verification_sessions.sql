CREATE TABLE IF NOT EXISTS verification_sessions (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    challenge_phrase TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'verified', 'failed', 'expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_verification_sessions_user_status
ON verification_sessions (telegram_id, status);

CREATE INDEX IF NOT EXISTS idx_verification_sessions_expires
ON verification_sessions (expires_at);
