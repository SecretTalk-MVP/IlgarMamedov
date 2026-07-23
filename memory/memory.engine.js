class MemoryEngine {

    constructor() {

    console.log("✅ MemoryEngine initialized");

    }

    analyze(memory, userMessage, aiAnswer) {

        memory = this.analyzeProfile(memory, userMessage);

        memory = this.analyzeConversation(memory, userMessage, aiAnswer);

        memory = this.analyzeRelationship(memory, userMessage);

        return memory;
    }


    analyzeProfile(memory, userMessage) {
        const text = userMessage.toLowerCase();
        if (!memory.profile) {
    memory.profile = {};
        }

if (text.includes("меня зовут ")) {

    memory.profile.name = userMessage
        .substring(text.indexOf("меня зовут ") + 11)
        .trim();

}

    }


    analyzeConversation(memory, userMessage, aiAnswer) {

        return memory;

    }


    analyzeRelationship(memory, userMessage) {

        return memory;

    }

}

module.exports = MemoryEngine;
