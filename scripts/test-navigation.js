/**
 * SecretTalk
 * Navigation Module — Independent Test
 *
 * This test verifies Navigation independently.
 * No Telegram.
 * No Router.
 * No AI.
 * No database.
 */

const navigation = require("../modules/navigation/navigation");

const userId = "test-user";

function assert(condition, message) {

    if (!condition) {
        throw new Error(`FAIL: ${message}`);
    }

    console.log(`PASS: ${message}`);
}


console.log("");
console.log("======================================");
console.log(" Navigation Independent Test");
console.log("======================================");


/*
 * 1. Initial state
 */

navigation.reset(userId);

assert(
    navigation.current(userId) === "main",
    "Initial screen is main"
);


/*
 * 2. Push screen
 */

navigation.push(
    userId,
    "find_partner"
);

assert(
    navigation.current(userId) === "find_partner",
    "Push changes current screen"
);


/*
 * 3. Push another screen
 */

navigation.push(
    userId,
    "characters"
);

assert(
    navigation.current(userId) === "characters",
    "Second screen becomes current"
);


/*
 * 4. Duplicate protection
 */

navigation.push(
    userId,
    "characters"
);

const stackAfterDuplicate =
    navigation.getStack(userId);

assert(
    stackAfterDuplicate.length === 3,
    "Duplicate screen is not added"
);


/*
 * 5. Pop
 */

const previousScreen =
    navigation.pop(userId);

assert(
    previousScreen === "find_partner",
    "Pop returns previous screen"
);

assert(
    navigation.current(userId) === "find_partner",
    "Previous screen becomes current"
);


/*
 * 6. Reset
 */

navigation.reset(userId);

assert(
    navigation.current(userId) === "main",
    "Reset returns navigation to main"
);


/*
 * 7. Final result
 */

console.log("");
console.log("======================================");
console.log(" Navigation test PASSED");
console.log("======================================");
console.log("");
