/**
 * SecretTalk — Architecture Governance Validator
 *
 * First automated governance layer.
 *
 * This file checks the basic architectural contract:
 *
 * - required architecture files exist;
 * - index.js exists;
 * - router.js exists;
 * - menu.js exists;
 * - modules/ exists;
 * - duplicate Router files are detected;
 * - duplicate application entrypoints are detected.
 *
 * This validator does NOT modify project files.
 * It only reports the current architectural state.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

let errors = 0;
let warnings = 0;

function exists(relativePath) {
    return fs.existsSync(
        path.join(ROOT, relativePath)
    );
}

function pass(message) {
    console.log(`✅ ${message}`);
}

function warn(message) {
    warnings++;
    console.log(`⚠️ ${message}`);
}

function fail(message) {
    errors++;
    console.log(`❌ ${message}`);
}

console.log("");
console.log("======================================");
console.log(" SecretTalk Architecture Governance");
console.log("======================================");
console.log("");

/*
 * Required architecture documents
 */

const requiredFiles = [
    "ARCHITECTURE/architecture.json",
    "ARCHITECTURE/governance.md",
    "ARCHITECTURE/workflow.md",
    "PROJECT_DEVELOPMENT_CONSTITUTION/CONSTITUTION.md",
    "PROJECT_DEVELOPMENT_CONSTITUTION/MODULE_STANDARD.md"
];

for (const file of requiredFiles) {

    if (exists(file)) {
        pass(`Architecture file: ${file}`);
    } else {
        fail(`Missing architecture file: ${file}`);
    }
}

/*
 * Required application structure
 */

const requiredApplicationFiles = [
    "index.js",
    "router.js",
    "menu.js",
    "modules"
];

for (const file of requiredApplicationFiles) {

    if (exists(file)) {
        pass(`Application structure: ${file}`);
    } else {
        fail(`Missing application structure: ${file}`);
    }
}

/*
 * Detect duplicate Router files.
 */

const possibleRouters = [
    "router.js",
    "modules/router.js",
    "modules/router/index.js"
];

const activeRouters = possibleRouters.filter(exists);

if (activeRouters.length === 1) {

    pass(`Single Router detected: ${activeRouters[0]}`);

} else if (activeRouters.length === 0) {

    fail("No Router detected.");

} else {

    fail(
        `Multiple Router candidates detected: ${activeRouters.join(", ")}`
    );
}

/*
 * Detect duplicate application entrypoints.
 */

const possibleEntrypoints = [
    "index.js",
    "app.js",
    "server.js",
    "main.js"
];

const existingEntrypoints =
    possibleEntrypoints.filter(exists);

if (
    existingEntrypoints.length === 1 &&
    existingEntrypoints[0] === "index.js"
) {

    pass("Single application entrypoint: index.js");

} else if (
    existingEntrypoints.length === 0
) {

    fail("No application entrypoint detected.");

} else {

    warn(
        `Additional possible entrypoints detected: ${existingEntrypoints.join(", ")}`
    );
}

/*
 * Check modules directory.
 */

const modulesPath =
    path.join(ROOT, "modules");

if (fs.existsSync(modulesPath)) {

    const moduleEntries =
        fs.readdirSync(
            modulesPath,
            { withFileTypes: true }
        );

    const directories =
        moduleEntries.filter(
            entry => entry.isDirectory()
        );

    pass(
        `Modules directory contains ${directories.length} module directories.`
    );

} else {

    fail("modules/ directory does not exist.");
}

/*
 * Final result.
 */

console.log("");
console.log("======================================");

if (errors > 0) {

    console.log(
        `❌ GOVERNANCE BLOCKED — ${errors} error(s), ${warnings} warning(s).`
    );

    process.exitCode = 1;

} else {

    console.log(
        `✅ GOVERNANCE PASSED — ${warnings} warning(s).`
    );

    process.exitCode = 0;
}

console.log("======================================");
console.log("");
