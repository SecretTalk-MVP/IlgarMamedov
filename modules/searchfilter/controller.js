const state = new Map();

function createDefaultState() {
    return {
        preferredGender: null,
        preferredAgeMin: null,
        preferredAgeMax: null,
        preferredCity: null,
        preferredGoal: null,
        activeField: null
    };
}

function get(userId) {

    if (!state.has(userId)) {
        state.set(userId, createDefaultState());
    }

    return state.get(userId);
}

function reset(userId) {

    state.set(userId, createDefaultState());

    return state.get(userId);
}

function remove(userId) {

    state.delete(userId);
}

module.exports = {
    get,
    reset,
    remove
};
