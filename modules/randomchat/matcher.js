const queue = require('./queue');
const session = require('./session');
const profile = require('../profile/profile');
const searchFilter = require('../searchfilter/state');

function matchesFilter(candidate, filter) {
    if (!candidate) {
        return false;
    }

    if (candidate.blocked === true) {
        return false;
    }

    if (
        filter.preferredGender &&
        candidate.gender !== (
            filter.preferredGender === 'female'
                ? 'woman'
                : filter.preferredGender
        )
    ) {
        return false;
    }

    if (
        filter.preferredAgeMin !== null &&
        (
            candidate.age === null ||
            candidate.age < filter.preferredAgeMin
        )
    ) {
        return false;
    }

    if (
        filter.preferredAgeMax !== null &&
        (
            candidate.age === null ||
            candidate.age > filter.preferredAgeMax
        )
    ) {
        return false;
    }

    if (
        filter.preferredCity &&
        (
            !candidate.city ||
            candidate.city.trim().toLowerCase() !==
            filter.preferredCity.trim().toLowerCase()
        )
    ) {
        return false;
    }

    if (
        filter.preferredGoal &&
        candidate.goal !== filter.preferredGoal
    ) {
        return false;
    }

    return true;
}

async function match(userId) {
    const userProfile =
        await profile.getMatchingProfile(userId);

    if (!userProfile || userProfile.blocked === true) {
        return null;
    }

    const userFilter =
        searchFilter.get(userId);

    const partnerId =
        await queue.takeNext(
            userId,
            async (candidateId) => {
                const candidateProfile =
                    await profile.getMatchingProfile(
                        candidateId
                    );

                if (!candidateProfile) {
                    return false;
                }

                const candidateFilter =
                    searchFilter.get(candidateId);

                const userAcceptedCandidate =
                    matchesFilter(
                        candidateProfile,
                        userFilter
                    );

                const candidateAcceptedUser =
                    matchesFilter(
                        userProfile,
                        candidateFilter
                    );

                return (
                    userAcceptedCandidate &&
                    candidateAcceptedUser
                );
            }
        );

    if (!partnerId) {
        return null;
    }

    session.connect(
        userId,
        partnerId
    );

    return partnerId;
}

module.exports = {
    match
};
