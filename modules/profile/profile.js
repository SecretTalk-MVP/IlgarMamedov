const db = require('../../database/db');

const GENDERS = Object.freeze([
    'male',
    'woman'
]);

const GOALS = Object.freeze([
    'chat',
    'dating',
    'friendship'
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
            verified,
            blocked
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

async function getMatchingProfile(userId) {
    if (!userId) {
        throw new Error('Profile requires userId');
    }

    const result = await db.query(
        `
        SELECT
            telegram_id,
            gender,
            age,
            city,
            goal,
            blocked
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

async function setAge(userId, age) {
    if (!userId) {
        throw new Error('Profile requires userId');
    }

    const normalizedAge = Number(age);

    if (
        !Number.isInteger(normalizedAge) ||
        normalizedAge < 18 ||
        normalizedAge > 100
    ) {
        throw new Error('Invalid profile age');
    }

    await db.query(
        `
        UPDATE users
        SET age = $2
        WHERE telegram_id = $1
        `,
        [userId, normalizedAge]
    );

    return normalizedAge;
}

async function setCity(userId, city) {
    if (!userId) {
        throw new Error('Profile requires userId');
    }

    const normalizedCity =
        typeof city === 'string'
            ? city.trim()
            : '';

    if (!normalizedCity) {
        throw new Error('Invalid profile city');
    }

    await db.query(
        `
        UPDATE users
        SET city = $2
        WHERE telegram_id = $1
        `,
        [userId, normalizedCity]
    );

    return normalizedCity;
}

async function setGoal(userId, goal) {
    if (!userId) {
        throw new Error('Profile requires userId');
    }

    if (!GOALS.includes(goal)) {
        throw new Error(`Invalid profile goal: ${goal}`);
    }

    await db.query(
        `
        UPDATE users
        SET goal = $2
        WHERE telegram_id = $1
        `,
        [userId, goal]
    );

    return goal;
}

async function hasRequiredProfile(userId) {
    const profile = await getProfile(userId);

    if (!profile) {
        return false;
    }

    return Boolean(profile.gender);
}

async function isBlocked(userId) {
    const result = await db.query(
        `
        SELECT blocked
        FROM users
        WHERE telegram_id = $1
        LIMIT 1
        `,
        [userId]
    );

    return result.rows[0]?.blocked === true;
}

module.exports = {
    GENDERS,
    GOALS,
    getProfile,
    getMatchingProfile,
    getGender,
    setGender,
    setAge,
    setCity,
    setGoal,
    hasRequiredProfile,
    isBlocked
};
