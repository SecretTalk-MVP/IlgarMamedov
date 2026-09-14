class Permissions {

    constructor() {

        this.superAdminId = 1496574112;

        this.admins = new Set();
    }

    isSuperAdmin(userId) {

        return Number(userId) === this.superAdminId;
    }

    isAdmin(userId) {

        const id = Number(userId);

        return (
            id === this.superAdminId ||
            this.admins.has(id)
        );
    }

    getRole(userId) {

        if (this.isSuperAdmin(userId)) {
            return 'SUPER_ADMIN';
        }

        if (this.admins.has(Number(userId))) {
            return 'ADMIN';
        }

        return null;
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

    canViewChatContent(userId) {

        return this.isSuperAdmin(userId);
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

    canManageAdmins(userId) {

        return this.isSuperAdmin(userId);
    }

    canViewAuditLog(userId) {

        return this.isSuperAdmin(userId);
    }

}

module.exports = new Permissions();
