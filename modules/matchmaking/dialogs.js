const state = require('./state');

function connect(user1, user2) {
    state.dialogs[user1] = user2;
    state.dialogs[user2] = user1;
}

function disconnect(userId) {
    const partnerId = state.dialogs[userId];

    if (!partnerId) {
        return null;
    }

    delete state.dialogs[userId];
    delete state.dialogs[partnerId];

    return partnerId;
}

function getPartner(userId) {
    return state.dialogs[userId] || null;
}

function isInDialog(userId) {
    return !!state.dialogs[userId];
}

module.exports = {
    connect,
    disconnect,
    getPartner,
    isInDialog
};
