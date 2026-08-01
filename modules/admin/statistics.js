/**
 * SecretTalk
 * Admin Statistics
 * Version: 1.1
 */

class Statistics {

    async get() {
        return {
            totalUsers: 0,
            onlineUsers: 0,
            activeChats: 0,
            aiChats: 0,
            waitingUsers: 0,
            uptime: process.uptime()
        };
    }

}

module.exports = new Statistics();
