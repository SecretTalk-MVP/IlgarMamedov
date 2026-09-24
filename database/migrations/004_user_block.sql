-- SecretTalk
-- Migration 004
-- User block state

ALTER TABLE users
ADD COLUMN IF NOT EXISTS blocked BOOLEAN DEFAULT FALSE;

UPDATE users
SET blocked = FALSE
WHERE blocked IS NULL;

ALTER TABLE users
ALTER COLUMN blocked SET DEFAULT FALSE;

ALTER TABLE users
ALTER COLUMN blocked SET NOT NULL;
