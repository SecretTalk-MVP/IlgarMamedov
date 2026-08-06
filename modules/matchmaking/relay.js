const dialogs = require('./dialogs');

async function relay(bot, msg, aiUsers) {
    if (aiUsers[msg.chat.id]) {
        return false;
    }

    const partnerId = dialogs.getPartner(msg.chat.id);

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
