class ContextBuilder {

    constructor() {
        console.log("✅ ContextBuilder initialized");
    }

    build(messages) {

        console.log("🧠 Building context...");

        return messages;

    }

}

module.exports = ContextBuilder;
