const session = require("./session");
const stt = require("./stt");
const challengeMatcher = require("./challenge-matcher");
const videoNote = require("./video-note");
const verification = require("./index");

async function startVerification(bot, msg) {
    const userId =
        msg.from.id;

    const verificationSession =
        await session.createSession(
            userId
        );

    await bot.sendMessage(
        msg.chat.id,
        `🔐 Верификация\n\n` +
        `Вам нужно записать короткое видеосообщение (Video Circle) ` +
        `и произнести фразу:\n\n` +
        `«${verificationSession.challenge_phrase}»\n\n` +
        `⏱ Фраза действительна ${session.SESSION_TTL_MINUTES} минут.\n\n` +
        `Отправьте именно круглое видеосообщение Telegram.`
    );

    return true;
}

async function handleVideoNote(bot, msg) {
    if (
        !msg ||
        !msg.from ||
        !msg.video_note
    ) {
        return false;
    }

    const userId =
        msg.from.id;

    const activeSession =
        await session.getActiveSession(
            userId
        );

    if (!activeSession) {
        return false;
    }

    try {
        const audio =
            await videoNote.downloadVideoNote(
                bot,
                msg.video_note
            );

        const transcript =
            await stt.transcribeAudio(
                audio.buffer,
                audio.filename
            );

        const matched =
            challengeMatcher.matchesChallenge(
                activeSession.challenge_phrase,
                transcript
            );

        if (!matched) {
            await session.markFailed(
                activeSession.id
            );

            await bot.sendMessage(
                msg.chat.id,
                "❌ Фраза не совпала.\n\n" +
                `Ожидалось: «${activeSession.challenge_phrase}»\n` +
                `Распознано: «${transcript}»\n\n` +
                "Запустите верификацию заново."
            );

            return true;
        }

        const verifiedSession =
            await session.markVerified(
                activeSession.id
            );

        if (!verifiedSession) {
            await bot.sendMessage(
                msg.chat.id,
                "⏱ Сессия верификации истекла. Запустите проверку заново."
            );

            return true;
        }

        await verification.setVerified(
            userId,
            true
        );

        await bot.sendMessage(
            msg.chat.id,
            "✅ Верификация успешно пройдена.\n\n" +
            "Теперь доступ к общению с Никой открыт."
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Verification video processing error:",
            error
        );

        await bot.sendMessage(
            msg.chat.id,
            "❌ Не удалось обработать видеосообщение.\n\n" +
            "Попробуйте записать Video Circle ещё раз."
        );

        return true;
    }
}

module.exports = {
    startVerification,
    handleVideoNote
};
