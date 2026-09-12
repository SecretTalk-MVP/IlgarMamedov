const state = require('./state');

function add(userId) {
    state.waiting.add(userId);
}

function remove(userId) {
    state.waiting.delete(userId);
}

function has(userId) {
    return state.waiting.has(userId);
}

function takeNext(excludeUserId) {
    for (const userId of state.waiting) {
        if (userId === excludeUserId) {
            continue;
        }

        state.waiting.delete(userId);
        return userId;
    }

    return null;
}

module.exports = {
    add,
    remove,
    has,
    takeNext
};
