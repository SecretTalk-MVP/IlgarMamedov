/**
 * SecretTalk
 * Admin Permissions
 * Version: 1.1
 */

const ADMIN_IDS = [
    process.env.ADMIN_ID
];

/**
 * Проверка прав администратора
 * @param {number|string} userId
 * @returns {boolean}
 */
function isAdmin(userId) {
    return ADMIN_IDS.includes(String(userId));
}

module.exports = {
    isAdmin
};
