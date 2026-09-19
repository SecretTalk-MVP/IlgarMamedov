const db = require('../../database/db');

async function startDialog(user1, user2) {
    const result = await db.query(
        `
        INSERT INTO dialogs (
            user1,
            user2,
            started_at,
            active
        )
        VALUES ($1, $2, CURRENT_TIMESTAMP, TRUE)
        RETURNING id
        `,
        [user1, user2]
    );

    return result.rows[0].id;
}

async function saveMessage(dialogId, msg) {
    if (!dialogId || !msg) {
        return null;
    }

    let messageType = 'text';
    let content = msg.text || null;

    if (msg.photo && msg.photo.length > 0) {
        messageType = 'photo';
        content = msg.photo[msg.photo.length - 1].file_id;
    } else if (msg.video) {
        messageType = 'video';
        content = msg.video.file_id;
    } else if (msg.voice) {
        messageType = 'voice';
        content = msg.voice.file_id;
    } else if (msg.audio) {
        messageType = 'audio';
        content = msg.audio.file_id;
    } else if (msg.document) {
        messageType = 'document';
        content = msg.document.file_id;
    } else if (msg.sticker) {
        messageType = 'sticker';
        content = msg.sticker.file_id;
    } else if (msg.video_note) {
        messageType = 'video_note';
        content = msg.video_note.file_id;
    } else if (msg.caption) {
        messageType = 'caption';
        content = msg.caption;
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
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING id
        `,
        [
            dialogId,
            msg.from.id,
            messageType,
            content
        ]
    );

    return result.rows[0].id;
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
        `,
        [dialogId]
    );
}

module.exports = {
    startDialog,
    saveMessage,
    endDialog
};
