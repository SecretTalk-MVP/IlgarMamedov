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
    console.log('=== RANDOM MATCH START ===');
    console.log('RANDOM MATCH USER ID:', userId);

    const userProfile =
        await profile.getMatchingProfile(userId);

    console.log(
        'RANDOM MATCH USER PROFILE:',
        userProfile
    );

    if (!userProfile) {
        console.log(
            'RANDOM MATCH STOP: USER PROFILE NOT FOUND'
        );
        return null;
    }

    if (userProfile.blocked === true) {
        console.log(
            'RANDOM MATCH STOP: USER IS BLOCKED'
        );
        return null;
    }

    const userFilter =
        searchFilter.get(userId);

    console.log(
        'RANDOM MATCH USER FILTER:',
        userFilter
    );

    const partnerId =
        await queue.takeNext(
            userId,
            async (candidateId) => {
                console.log(
                    'RANDOM MATCH CANDIDATE:',
                    candidateId
                );

                const candidateProfile =
                    await profile.getMatchingProfile(
                        candidateId
                    );

                console.log(
                    'RANDOM MATCH CANDIDATE PROFILE:',
                    candidateProfile
                );

                if (!candidateProfile) {
                    console.log(
                        'RANDOM MATCH REJECT: CANDIDATE PROFILE NOT FOUND'
                    );
                    return false;
                }

                const candidateFilter =
                    searchFilter.get(candidateId);

                console.log(
                    'RANDOM MATCH CANDIDATE FILTER:',
                    candidateFilter
                );

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

                console.log(
                    'RANDOM MATCH FILTER RESULT:',
                    {
                        userAcceptedCandidate,
                        candidateAcceptedUser
                    }
                );

                return (
                    userAcceptedCandidate &&
                    candidateAcceptedUser
                );
            }
        );

    console.log(
        'RANDOM MATCH RESULT:',
        partnerId
    );

    if (!partnerId) {
        console.log(
            'RANDOM MATCH: NO PARTNER'
        );
        return null;
    }

    session.connect(
        userId,
        partnerId
    );

    console.log(
        'RANDOM MATCH CONNECTED:',
        {
            userId,
            partnerId
        }
    );

    return partnerId;
}

module.exports = {
    match
};
