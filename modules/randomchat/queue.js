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

async function takeNext(excludeUserId, predicate) {
    for (const userId of state.waiting) {
        if (userId === excludeUserId) {
            continue;
        }

        if (predicate && !(await predicate(userId))) {
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
