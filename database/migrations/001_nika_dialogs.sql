-- Nika dialog history support
-- Adds a dialog type without changing existing Random Chat behavior.

ALTER TABLE dialogs
ADD COLUMN IF NOT EXISTS dialog_type TEXT DEFAULT 'random';

UPDATE dialogs
SET dialog_type = 'random'
WHERE dialog_type IS NULL;

CREATE INDEX IF NOT EXISTS idx_dialogs_type_started
ON dialogs (dialog_type, started_at);
