/**
 * SecretTalk
 * Admin Statistics
 * Version: 1.0
 */

function getStatistics(data) {
    return {
        totalUsers: data.totalUsers || 0,
        onlineUsers: data.onlineUsers || 0,
        dialogs: data.dialogs || 0,
        waitingUsers: data.waitingUsers || 0,
        aiChats: data.aiChats || 0
    };
}

module.exports = {
    getStatistics
};
