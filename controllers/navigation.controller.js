const userHistory = {};

function pushHistory(userId, screen) {
    if (!userHistory[userId]) {
        userHistory[userId] = [];
    }

    userHistory[userId].push(screen);
}

function goBack(userId) {
    if (!userHistory[userId] || userHistory[userId].length < 2) {
        return null;
    }

    userHistory[userId].pop();

    return userHistory[userId][userHistory[userId].length - 1];
}

module.exports = {
    pushHistory,
    goBack
};
