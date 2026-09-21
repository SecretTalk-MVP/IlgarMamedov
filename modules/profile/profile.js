const db = require('../../database/db');

const GENDERS = Object.freeze([
    'male',
    'woman'
]);

async function getProfile(userId) {
    if (!userId) {
        throw new Error('Profile requires userId');
    }

    const result = await db.query(
        `
        SELECT
            telegram_id,
            username,
            first_name,
            gender,
            age,
            city,
            goal,
            verified
        FROM users
        WHERE telegram_id = $1
        LIMIT 1
        `,
        [userId]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
}

async function getGender(userId) {
    const profile = await getProfile(userId);

    if (!profile) {
        return null;
    }

    return profile.gender || null;
}

async function setGender(userId, gender) {
    if (!userId) {
        throw new Error('Profile requires userId');
    }

    if (!GENDERS.includes(gender)) {
        throw new Error(`Invalid profile gender: ${gender}`);
    }

    await db.query(
        `
        UPDATE users
        SET gender = $2
        WHERE telegram_id = $1
        `,
        [userId, gender]
    );

    return gender;
}

async function hasRequiredProfile(userId) {
    const profile = await getProfile(userId);

    if (!profile) {
        return false;
    }

    return Boolean(profile.gender);
}

module.exports = {
    GENDERS,
    getProfile,
    getGender,
    setGender,
    hasRequiredProfile
};
