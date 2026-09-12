const queue = require('./queue');
const session = require('./session');

function match(userId) {
    const partnerId = queue.takeNext(userId);

    if (!partnerId) {
        return null;
    }

    session.connect(userId, partnerId);

    return partnerId;
}

module.exports = {
    match
};
