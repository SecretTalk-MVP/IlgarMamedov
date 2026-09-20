const db = require('../../database/db');

const NIKA_DIALOG_TYPE = 'nika';
const NIKA_SENDER_ID = 0;

async function getActiveDialog(userId) {
    const result = await db.query(
        `
        SELECT id
        FROM dialogs
        WHERE dialog_type = $1
          AND active = TRUE
          AND (
              user1 = $2
              OR user2 = $2
          )
        ORDER BY started_at DESC
        LIMIT 1
        `,
        [
            NIKA_DIALOG_TYPE,
            userId
        ]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0].id;
}

async function startDialog(userId) {
    const existingDialogId = await getActiveDialog(userId);

    if (existingDialogId) {
        return existingDialogId;
    }

    const result = await db.query(
        `
        INSERT INTO dialogs (
            user1,
            user2,
            started_at,
            active,
            dialog_type
        )
        VALUES (
            $1,
            $2,
            CURRENT_TIMESTAMP,
            TRUE,
            $3
        )
        RETURNING id
        `,
        [
            userId,
            NIKA_SENDER_ID,
            NIKA_DIALOG_TYPE
        ]
    );

    return result.rows[0].id;
}

async function saveMessage(
    dialogId,
    sender,
    messageType,
    content
) {
    if (!dialogId) {
        return null;
    }

    const result = await db.query(
        `
        INSERT INTO messages (
            dialog_id,
            sender,
            message_type,
            content,
            created_at
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            CURRENT_TIMESTAMP
        )
        RETURNING id
        `,
        [
            dialogId,
            sender,
            messageType,
            content
        ]
    );

    return result.rows[0].id;
}

async function saveUserMessage(
    dialogId,
    userId,
    content
) {
    return saveMessage(
        dialogId,
        userId,
        'text',
        content
    );
}

async function saveAssistantMessage(
    dialogId,
    content
) {
    return saveMessage(
        dialogId,
        NIKA_SENDER_ID,
        'text',
        content
    );
}

async function getRecentMessages(
    dialogId,
    limit = 20
) {
    if (!dialogId) {
        return [];
    }

    const safeLimit = Math.max(
        1,
        Math.min(
            Number(limit) || 20,
            100
        )
    );

    const result = await db.query(
        `
        SELECT
            sender,
            message_type,
            content,
            created_at
        FROM messages
        WHERE dialog_id = $1
        ORDER BY created_at DESC, id DESC
        LIMIT $2
        `,
        [
            dialogId,
            safeLimit
        ]
    );

    return result.rows.reverse();
}

async function endDialog(dialogId) {
    if (!dialogId) {
        return;
    }

    await db.query(
        `
        UPDATE dialogs
        SET
            active = FALSE,
            ended_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND dialog_type = $2
        `,
        [
            dialogId,
            NIKA_DIALOG_TYPE
        ]
    );
}

module.exports = {
    getActiveDialog,
    startDialog,
    saveMessage,
    saveUserMessage,
    saveAssistantMessage,
    getRecentMessages,
    endDialog,
    NIKA_SENDER_ID,
    NIKA_DIALOG_TYPE
};
