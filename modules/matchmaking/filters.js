const state = require('./state');

function set(userId, filters) {
    state.filters[userId] = filters;
}

function get(userId) {
    return state.filters[userId] || {};
}

function clear(userId) {
    delete state.filters[userId];
}

module.exports = {
    set,
    get,
    clear
};
