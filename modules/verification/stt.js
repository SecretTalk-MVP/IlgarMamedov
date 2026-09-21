const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

const OpenAI =
    require("axios");

const STT_MODEL =
    process.env.VERIFICATION_STT_MODEL ||
    "gpt-4o-mini-transcribe";

async function transcribeAudio(
    audioBuffer,
    filename = "verification.ogg"
) {
    if (!Buffer.isBuffer(audioBuffer)) {
        throw new Error(
            "STT requires audio buffer"
        );
    }

    if (audioBuffer.length === 0) {
        throw new Error(
            "STT received empty audio"
        );
    }

    const apiKey =
        process.env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error(
            "OPENAI_API_KEY is not configured"
        );
    }

    const tempDir =
        await fs.promises.mkdtemp(
            path.join(
                os.tmpdir(),
                "secret-talk-stt-"
            )
        );

    const tempPath =
        path.join(
            tempDir,
            `${crypto.randomUUID()}-${filename}`
        );

    try {
        await fs.promises.writeFile(
            tempPath,
            audioBuffer
        );

        const form =
            new FormData();

        const file =
            new Blob(
                [
                    await fs.promises.readFile(
                        tempPath
                    )
                ],
                {
                    type: "audio/ogg"
                }
            );

        form.append(
            "file",
            file,
            filename
        );

        form.append(
            "model",
            STT_MODEL
        );

        form.append(
            "language",
            "ru"
        );

        const response =
            await OpenAI.post(
                "https://api.openai.com/v1/audio/transcriptions",
                form,
                {
                    headers: {
                        Authorization:
                            `Bearer ${apiKey}`
                    },
                    maxBodyLength:
                        Infinity,
                    maxContentLength:
                        Infinity
                }
            );

        const text =
            response?.data?.text;

        if (
            typeof text !== "string" ||
            !text.trim()
        ) {
            throw new Error(
                "STT returned empty transcription"
            );
        }

        return text.trim();

    } finally {

        try {
            await fs.promises.rm(
                tempPath,
                {
                    force: true
                }
            );

            await fs.promises.rm(
                tempDir,
                {
                    recursive: true,
                    force: true
                }
            );

        } catch (cleanupError) {

            console.error(
                "⚠️ STT temporary file cleanup failed:",
                cleanupError
            );
        }
    }
}

module.exports = {
    STT_MODEL,
    transcribeAudio
};
