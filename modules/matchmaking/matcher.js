const state = require('./state');
const queue = require('./queue');
const dialogs = require('./dialogs');

function findPartner(userId, aiUsers) {
    let partnerId = null;

    while (state.waitingUsers.length > 0) {
        const candidate = state.waitingUsers.shift();

        if (candidate === userId) {
            continue;
        }

        if (aiUsers[candidate]) {
            continue;
        }

        partnerId = candidate;
        break;
    }

    if (partnerId) {
        dialogs.connect(userId, partnerId);
    }

    return partnerId;
}

module.exports = {
    findPartner
};
