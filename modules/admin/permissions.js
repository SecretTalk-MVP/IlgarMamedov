class Permissions {

    isAdmin(userId) {

        const adminId = Number(process.env.ADMIN_ID);

        return Number(userId) === adminId;
    }

}

module.exports = new Permissions();
