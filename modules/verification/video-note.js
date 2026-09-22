const axios = require("axios");

async function downloadVideoNote(bot, videoNote) {
    if (!videoNote || !videoNote.file_id) {
        throw new Error(
            "Verification requires Telegram video_note"
        );
    }

    const fileLink =
        await bot.getFileLink(
            videoNote.file_id
        );

    const response =
        await axios.get(
            fileLink,
            {
                responseType: "arraybuffer",
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

    const buffer =
        Buffer.from(
            response.data
        );

    if (buffer.length === 0) {
        throw new Error(
            "Telegram video_note is empty"
        );
    }

    return {
        buffer,
        filename: `verification-${videoNote.file_id}.mp4`
    };
}

module.exports = {
    downloadVideoNote
};
