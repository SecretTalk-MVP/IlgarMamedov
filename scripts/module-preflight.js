/**
 * SecretTalk — Module Preflight Validator
 *
 * Checks a NEW module before integration.
 *
 * Usage:
 *   node scripts/module-preflight.js aida
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const moduleName = process.argv[2];

let errors = 0;
let warnings = 0;

function pass(message) {
    console.log(`PASS  ${message}`);
}

function warn(message) {
    warnings++;
    console.log(`WARN  ${message}`);
}

function fail(message) {
    errors++;
    console.log(`FAIL  ${message}`);
}

function exists(relativePath) {
    return fs.existsSync(
        path.join(ROOT, relativePath)
    );
}

console.log("");
console.log("======================================");
console.log(" SecretTalk Module Preflight");
console.log("======================================");

if (!moduleName) {
    fail("Module name was not provided.");
    console.log("");
    console.log(
        "Usage: node scripts/module-preflight.js <module>"
    );
    process.exitCode = 1;
    process.exit();
}

if (!/^[a-z0-9_-]+$/.test(moduleName)) {
    fail(
        "Module name must contain only lowercase letters, numbers, '-' or '_'."
    );
    process.exitCode = 1;
    process.exit();
}

const modulePath =
    path.join("modules", moduleName);

console.log("");
console.log(`Checking module: ${modulePath}`);

/*
 * 1. Module directory
 */

if (!exists(modulePath)) {

    pass(
        "Module does not exist yet — correct for CREATE stage."
    );

} else {

    fail(
        `Module already exists: ${modulePath}`
    );
}

/*
 * 2. Module name collision
 */

const rootModuleFile =
    path.join("modules", `${moduleName}.js`);

if (exists(rootModuleFile)) {

    fail(
        `Module file collision detected: ${rootModuleFile}`
    );

} else {

    pass(
        "No module file collision detected."
    );
}

/*
 * 3. Duplicate Router
 */

const routerCandidates = [
    "router.js",
    "modules/router.js",
    "modules/router/index.js"
];

const routers =
    routerCandidates.filter(exists);

if (routers.length === 1) {

    pass(
        `Single Router detected: ${routers[0]}`
    );

} else if (routers.length === 0) {

    fail(
        "No Router detected."
    );

} else {

    fail(
        `Multiple Router implementations detected: ${routers.join(", ")}`
    );
}

/*
 * 4. Application entrypoint
 */

if (exists("index.js")) {

    pass(
        "Application entrypoint exists: index.js"
    );

} else {

    fail(
        "Application entrypoint index.js is missing."
    );
}

/*
 * 5. Module location
 */

if (exists("modules")) {

    pass(
        "Module root exists: modules/"
    );

} else {

    fail(
        "Module root modules/ is missing."
    );
}

/*
 * 6. Naming rule
 */

if (
    moduleName === moduleName.toLowerCase()
) {

    pass(
        "Module name uses lowercase convention."
    );

} else {

    fail(
        "Module name must be lowercase."
    );
}

/*
 * 7. Existing implementation detection
 */

const possibleLegacyPaths = [
    `${moduleName}.js`,
    `modules/${moduleName}.js`,
    `src/${moduleName}.js`,
    `services/${moduleName}.js`
];

const legacyPaths =
    possibleLegacyPaths.filter(exists);

for (const legacyPath of legacyPaths) {

    fail(
        `Possible existing implementation detected: ${legacyPath}`
    );
}

if (legacyPaths.length === 0) {

    pass(
        "No known legacy implementation detected."
    );
}

/*
 * 8. Governance documents
 */

const requiredDocuments = [
    "ARCHITECTURE/architecture.json",
    "ARCHITECTURE/governance.md",
    "PROJECT_DEVELOPMENT_CONSTITUTION/CONSTITUTION.md",
    "PROJECT_DEVELOPMENT_CONSTITUTION/MODULE_STANDARD.md"
];

for (const document of requiredDocuments) {

    if (exists(document)) {

        pass(
            `Governance document exists: ${document}`
        );

    } else {

        fail(
            `Governance document missing: ${document}`
        );
    }
}

/*
 * 9. Result
 */

console.log("");
console.log("======================================");

if (errors > 0) {

    console.log(
        `PREFLIGHT BLOCKED — ${errors} error(s), ${warnings} warning(s).`
    );

    process.exitCode = 1;

} else {

    console.log(
        `PREFLIGHT PASSED — ${warnings} warning(s).`
    );

    console.log("");
    console.log(
        `Module "${moduleName}" is cleared for CREATE stage.`
    );

    process.exitCode = 0;
}

console.log("======================================");
console.log("");
