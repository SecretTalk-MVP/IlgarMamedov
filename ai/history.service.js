class HistoryService {

    constructor() {

        console.log("✅ HistoryService initialized");

    }

    getHistory(userId) {

        return [];

    }

    saveMessage(userId, role, content) {

        return true;

    }

}

module.exports = HistoryService;
