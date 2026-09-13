const session = require('./session');

async function relay(bot, msg) {
    const partnerId = session.getPartner(msg.chat.id);

    if (!partnerId) {
        return false;
    }

    try {
        await bot.copyMessage(
            partnerId,
            msg.chat.id,
            msg.message_id
        );
    } catch (err) {
        console.log(err);
    }

    return true;
}

module.exports = relay;
