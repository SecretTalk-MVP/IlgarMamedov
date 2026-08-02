class Permissions {

    constructor() {
    this.adminId = 1496574112;
    }

    isAdmin(userId) {
        return Number(userId) === this.adminId;
    }

    canViewStatistics(userId) {
        return this.isAdmin(userId);
    }

    canViewUsers(userId) {
        return this.isAdmin(userId);
    }

    canViewChats(userId) {
        return this.isAdmin(userId);
    }

    canBroadcast(userId) {
        return this.isAdmin(userId);
    }

    canBanUsers(userId) {
        return this.isAdmin(userId);
    }

    canOpenSettings(userId) {
        return this.isAdmin(userId);
    }

}

module.exports = new Permissions();
