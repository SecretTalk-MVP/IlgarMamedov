const session = require('./session');
const history = require('./history');

async function relay(bot, msg) {
    const userId = msg.chat.id;
    const partnerId = session.getPartner(userId);

    if (!partnerId) {
        return false;
    }

    try {
        await bot.copyMessage(
            partnerId,
            msg.chat.id,
            msg.message_id
        );

        const dialogId = session.getDialogId(userId);

        if (dialogId) {
            await history.saveMessage(
                dialogId,
                msg
            );
        }

    } catch (err) {
        console.error(
            'Random Chat relay error:',
            err
        );
    }

    return true;
}

module.exports = relay;
