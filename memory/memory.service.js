class MemoryService {

    async loadMemory(userId) {

        return {
            profile: {
                name: null,
                gender: null,
                age: null,
                country: null,
                language: null
            },

            conversation: {
                summary: "",
                lastTopic: "",
                lastInteraction: null
            },

            relationship: {
                trustLevel: 0,
                notes: [],
                promises: []
            }
        };

    }

}

module.exports = MemoryService;
