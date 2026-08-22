/**
 * SecretTalk — Architecture Governance Validator
 *
 * Governance Layer — Stage 1
 *
 * This validator checks the architecture against
 * ARCHITECTURE/architecture.json.
 *
 * It does not modify project files.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ARCHITECTURE_FILE = path.join(
    ROOT,
    "ARCHITECTURE",
    "architecture.json"
);

let errors = 0;
let warnings = 0;

function exists(relativePath) {
    return fs.existsSync(
        path.join(ROOT, relativePath)
    );
}

function read(relativePath) {
    return fs.readFileSync(
        path.join(ROOT, relativePath),
        "utf8"
    );
}

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

function section(title) {
    console.log("");
    console.log(`--- ${title} ---`);
}

console.log("");
console.log("======================================");
console.log(" SecretTalk Architecture Governance");
console.log("======================================");

/*
 * =========================================================
 * 1. ARCHITECTURE DEFINITION
 * =========================================================
 */

section("Architecture Definition");

if (!exists("ARCHITECTURE/architecture.json")) {

    fail(
        "ARCHITECTURE/architecture.json does not exist."
    );

    console.log("");
    console.log("GOVERNANCE BLOCKED.");
    process.exitCode = 1;
    process.exit();
}

let architecture;

try {

    architecture = JSON.parse(
        fs.readFileSync(
            ARCHITECTURE_FILE,
            "utf8"
        )
    );

    pass(
        "architecture.json loaded successfully."
    );

} catch (error) {

    fail(
        "architecture.json is invalid JSON."
    );

    console.log("");
    console.log("GOVERNANCE BLOCKED.");
    process.exitCode = 1;
    process.exit();
}

/*
 * =========================================================
 * 2. REQUIRED GOVERNANCE DOCUMENTS
 * =========================================================
 */

section("Governance Documents");

const constitution =
    architecture.governance?.constitution;

const moduleStandard =
    architecture.governance?.module_standard;

if (constitution && exists(constitution)) {

    pass(
        `Constitution exists: ${constitution}`
    );

} else {

    fail(
        `Constitution missing: ${constitution || "undefined"}`
    );
}

if (moduleStandard && exists(moduleStandard)) {

    pass(
        `Module Standard exists: ${moduleStandard}`
    );

} else {

    fail(
        `Module Standard missing: ${moduleStandard || "undefined"}`
    );
}

/*
 * =========================================================
 * 3. APPLICATION ENTRYPOINT
 * =========================================================
 */

section("Application Entrypoint");

const applicationEntrypoint =
    architecture.application_entrypoint?.file;

if (!applicationEntrypoint) {

    fail(
        "Application entrypoint is not defined in architecture.json."
    );

} else if (!exists(applicationEntrypoint)) {

    fail(
        `Application entrypoint missing: ${applicationEntrypoint}`
    );

} else {

    pass(
        `Application entrypoint: ${applicationEntrypoint}`
    );
}

/*
 * Detect additional application entrypoint candidates.
 */

const entrypointCandidates = [
    "app.js",
    "server.js",
    "main.js"
];

for (const candidate of entrypointCandidates) {

    if (exists(candidate)) {

        warn(
            `Additional entrypoint candidate detected: ${candidate}`
        );
    }
}

/*
 * =========================================================
 * 4. SINGLE ROUTER
 * =========================================================
 */

section("Router");

const routerFile =
    architecture.router?.file;

if (!routerFile) {

    fail(
        "Router is not defined in architecture.json."
    );

} else if (!exists(routerFile)) {

    fail(
        `Router missing: ${routerFile}`
    );

} else {

    pass(
        `Main Router: ${routerFile}`
    );
}

/*
 * Detect known parallel Router locations.
 */

const parallelRouterCandidates = [
    "modules/router.js",
    "modules/router/index.js"
];

for (const candidate of parallelRouterCandidates) {

    if (exists(candidate)) {

        fail(
            `Parallel Router detected: ${candidate}`
        );
    }
}

/*
 * =========================================================
 * 5. MENU
 * =========================================================
 */

section("Menu");

const menuFile =
    architecture.menu?.file;

if (!menuFile) {

    fail(
        "Menu is not defined in architecture.json."
    );

} else if (!exists(menuFile)) {

    fail(
        `Menu missing: ${menuFile}`
    );

} else {

    pass(
        `Main Menu: ${menuFile}`
    );
}

/*
 * =========================================================
 * 6. MODULE DIRECTORY
 * =========================================================
 */

section("Modules");

const modulesLocation =
    architecture.modules?.location;

if (!modulesLocation) {

    fail(
        "Module location is not defined in architecture.json."
    );

} else if (!exists(modulesLocation)) {

    fail(
        `Module directory missing: ${modulesLocation}`
    );

} else {

    pass(
        `Module directory: ${modulesLocation}`
    );

    const modulesPath =
        path.join(ROOT, modulesLocation);

    const entries =
        fs.readdirSync(
            modulesPath,
            { withFileTypes: true }
        );

    const moduleDirectories =
        entries.filter(
            entry =>
                entry.isDirectory()
        );

    pass(
        `Detected ${moduleDirectories.length} module directories.`
    );
}

/*
 * =========================================================
 * 7. MODULE INDEX WARNING
 * =========================================================
 *
 * modules/index.js exists in the current repository.
 * It is not automatically treated as a violation because
 * the Module Standard explicitly allows architecture
 * decisions where required.
 */

if (exists("modules/index.js")) {

    warn(
        "modules/index.js exists. Verify that it is not acting as a second application entrypoint."
    );
}

/*
 * =========================================================
 * 8. ROUTER ARCHITECTURAL RULES
 * =========================================================
 */

section("Router Contract");

if (exists(routerFile)) {

    const routerSource =
        read(routerFile);

    if (
        routerSource.includes(
            "require(\"./modules/"
        )
        ||
        routerSource.includes(
            "require('./modules/"
        )
    ) {

        pass(
            "Router contains module registrations."
        );

    } else {

        warn(
            "No module registration pattern detected in Router."
        );
    }

    /*
     * Router should not import index.js.
     */

    if (
        routerSource.includes(
            "require(\"./index"
        )
        ||
        routerSource.includes(
            "require('./index"
        )
    ) {

        fail(
            "Router imports application entrypoint index.js."
        );
    }

    /*
     * Router should not import another Router.
     */

    if (
        routerSource.includes(
            "modules/router"
        )
    ) {

        fail(
            "Router references modules/router. Possible parallel Router."
        );
    }
}

/*
 * =========================================================
 * 9. INDEX ARCHITECTURAL RULES
 * =========================================================
 */

section("Index Contract");

if (exists(applicationEntrypoint)) {

    const indexSource =
        read(applicationEntrypoint);

    if (
        indexSource.includes(
            "router"
        )
    ) {

        pass(
            "index.js references the main Router."
        );

    } else {

        warn(
            "index.js does not visibly reference Router."
        );
    }

    /*
     * Detect obvious business-logic indicators.
     */

    const forbiddenPatterns = [
        "class Router",
        "function handleMessage",
        "function showMainMenu"
    ];

    for (
        const pattern of forbiddenPatterns
    ) {

        if (
            indexSource.includes(pattern)
        ) {

            fail(
                `Possible business logic in index.js: ${pattern}`
            );
        }
    }
}

/*
 * =========================================================
 * 10. MODULE INTEGRATION RULES
 * =========================================================
 */

section("Module Integration Contract");

const integration =
    architecture.module_integration || {};

if (
    integration.router_required_for_user_modules === true
) {

    pass(
        "User-facing modules require Router registration."
    );
}

if (
    integration.index_required_only_for_root_lifecycle === true
) {

    pass(
        "Normal modules must not require direct index.js integration."
    );
}

if (
    integration.duplicate_active_implementations_allowed === false
) {

    pass(
        "Duplicate active implementations are forbidden."
    );
}

/*
 * =========================================================
 * 11. STATE MANAGEMENT
 * =========================================================
 */

section("State Management");

const stateOwner =
    architecture.state_management?.owner;

if (stateOwner) {

    if (exists(stateOwner)) {

        pass(
            `State owner exists: ${stateOwner}`
        );

    } else {

        fail(
            `State owner missing: ${stateOwner}`
        );
    }

} else {

    fail(
        "State management owner is not defined."
    );
}

/*
 * =========================================================
 * 12. GOVERNANCE SUMMARY
 * =========================================================
 */

console.log("");
console.log("======================================");

if (errors > 0) {

    console.log(
        `GOVERNANCE BLOCKED — ${errors} error(s), ${warnings} warning(s).`
    );

    process.exitCode = 1;

} else {

    console.log(
        `GOVERNANCE PASSED — ${warnings} warning(s).`
    );

    process.exitCode = 0;
}

console.log("======================================");
console.log("");
