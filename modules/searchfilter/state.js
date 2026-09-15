const state = new Map();

function get(userId) {

    if (!state.has(userId)) {

        state.set(
            userId,
            {
                preferredGender: null,
                preferredAgeMin: null,
                preferredAgeMax: null,
                preferredCity: null,
                preferredGoal: null
            }
        );
    }

    return state.get(userId);
}

function reset(userId) {

    state.set(
        userId,
        {
            preferredGender: null,
            preferredAgeMin: null,
            preferredAgeMax: null,
            preferredCity: null,
            preferredGoal: null
        }
    );

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
