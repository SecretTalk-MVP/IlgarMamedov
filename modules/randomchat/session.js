const state = require('./state');

function connect(user1, user2) {
    state.sessions.set(user1, user2);
    state.sessions.set(user2, user1);
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

    return partnerId;
}

module.exports = {
    connect,
    getPartner,
    isInDialog,
    disconnect
};
