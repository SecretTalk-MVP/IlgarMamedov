const state = require('./state');

function connect(user1, user2) {
    state.sessions.set(user1, user2);
    state.sessions.set(user2, user1);
}

function setDialogId(userId, dialogId) {
    if (!state.dialogs) {
        state.dialogs = new Map();
    }

    state.dialogs.set(userId, dialogId);
}

function getDialogId(userId) {
    if (!state.dialogs) {
        return null;
    }

    return state.dialogs.get(userId) || null;
}

function getPartner(userId) {
    return state.sessions.get(userId) || null;
}

function isInDialog(userId) {
    return state.sessions.has(userId);
}

function disconnect(userId) {
    const partnerId = state.sessions.get(userId);

    if (!partnerId) {
        return null;
    }

    state.sessions.delete(userId);
    state.sessions.delete(partnerId);

    if (state.dialogs) {
        state.dialogs.delete(userId);
        state.dialogs.delete(partnerId);
    }

    return partnerId;
}

module.exports = {
    connect,
    setDialogId,
    getDialogId,
    getPartner,
    isInDialog,
    disconnect
};
