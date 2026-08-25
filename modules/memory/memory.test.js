/**
 * SecretTalk
 * Unified Memory — Independent Test
 *
 * This test verifies the new Memory module
 * without connecting it to the application.
 */

const memory = require("./memory");


console.log("\n🧪 MEMORY TEST START\n");


/*
 * TEST 1
 * Empty memory
 */

const empty = memory.createEmpty();

console.log("TEST 1 — createEmpty");

if (
    !empty ||
    !empty.profile ||
    !empty.preferences ||
    !empty.conversation ||
    !empty.relationship
) {
    throw new Error("❌ createEmpty() failed");
}

console.log("✅ createEmpty() passed");


/*
 * TEST 2
 * Normalize
 */

console.log("\nTEST 2 — normalize");

const normalized = memory.normalize({
    profile: {
        name: "Ильгар"
    }
});

if (
    normalized.profile.name !== "Ильгар" ||
    !normalized.preferences ||
    !normalized.conversation ||
    !normalized.relationship
) {
    throw new Error("❌ normalize() failed");
}

console.log("✅ normalize() passed");


/*
 * TEST 3
 * Remember name
 */

console.log("\nTEST 3 — update()");

const updated = memory.update(
    empty,
    "Меня зовут Ильгар"
);

if (updated.profile.name !== "Ильгар") {
    throw new Error(
        "❌ Memory did not remember the user's name"
    );
}

console.log("✅ Name remembered:", updated.profile.name);


/*
 * TEST 4
 * Update existing memory
 */

console.log("\nTEST 4 — preserve existing memory");

const updatedAgain = memory.update(
    updated,
    "Я говорю по-русски"
);

if (
    updatedAgain.profile.name !== "Ильгар" ||
    updatedAgain.profile.language !== "ru"
) {
    throw new Error(
        "❌ Existing memory was not preserved"
    );
}

console.log("✅ Existing memory preserved");


/*
 * TEST 5
 * Relevant memory
 */

console.log("\nTEST 5 — getRelevant()");

const relevant = memory.getRelevant(
    updatedAgain,
    ["profile"]
);

if (
    !relevant.profile ||
    relevant.profile.name !== "Ильгар"
) {
    throw new Error(
        "❌ getRelevant() failed"
    );
}

console.log("✅ getRelevant() passed");


console.log("\n🎉 ALL MEMORY TESTS PASSED\n");
