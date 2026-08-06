const state = require('./state');

function add(userId) {
    if (!state.waitingUsers.includes(userId)) {
        state.waitingUsers.push(userId);
    }
}

function remove(userId) {
    const index = state.waitingUsers.indexOf(userId);

    if (index !== -1) {
        state.waitingUsers.splice(index, 1);
    }
}

function has(userId) {
    return state.waitingUsers.includes(userId);
}

module.exports = {
    add,
    remove,
    has
};
