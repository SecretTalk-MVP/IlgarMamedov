# SECRET TALK — MODULE STANDARD

## Purpose

This document defines the mandatory standard for creating, replacing, integrating, verifying, and deploying every SecretTalk module.

The purpose is to make module development predictable and repeatable.

The same integration process must be used for every module unless an explicit architecture change is approved.

---

## 1. Module location

Every functional module belongs under:

`modules/<module-name>/`

A module must not be split between multiple independent locations.

If functionality already belongs to an existing module, do not create a second module for the same responsibility.

---

## 2. Before creating a module

Before creating anything, determine:

1. What function the module provides.
2. Whether this function already exists.
3. Which existing files implement this function.
4. Whether the existing implementation is active.
5. What the new module's public entrypoint will be.
6. Whether the module needs Router integration.
7. Whether it needs Index integration.
8. Whether it needs a menu, command, button, callback, or other user entrypoint.
9. Which old implementation must be removed.
10. How the module will be independently verified.

This is the mandatory preflight.

Do not begin by creating files blindly.

---

## 3. Module structure

A module contains only the files required for its responsibility.

Example:

`modules/aida/`

may contain:

- character definition;
- module logic;
- memory;
- context;
- configuration specific to AiDa;
- module documentation.

Do not create unnecessary files merely to make every module look identical.

The structure is standardized by responsibility, not by forcing every module to contain the same filenames.

---

## 4. No module index by default

Do not automatically create:

`modules/<module-name>/index.js`

A module receives an `index.js` only if an explicit architecture decision requires it.

The module's main file should normally have a descriptive name.

Examples:

`modules/aida/aida.js`

`modules/matchmaking/routes.js`

`modules/admin/permissions.js`

---

## 5. Public entrypoint

Every module must have a clearly defined public entrypoint.

Examples:

`handle(bot, msg)`

`handleCallback(bot, query)`

`show(bot, chatId)`

or another documented interface appropriate to the module.

The public entrypoint is the only interface that the Router or another external layer should use unless another public API is explicitly documented.

Internal functions remain internal to the module.

---

## 6. Independent verification

Before connecting a new module to the application:

1. Load the module.
2. Verify its dependencies.
3. Verify its public entrypoint.
4. Execute its core operation.
5. Confirm expected output.
6. Confirm that failures are handled correctly.

The module must work independently before integration.

Do not debug the module for the first time through the production Router.

---

## 7. Router integration

User-facing modules are normally connected through the single root:

`router.js`

Integration follows this exact sequence:

`IMPORT`

↓

`ENTRY CONDITION`

↓

`STATE / ROUTE`

↓

`MODULE ENTRYPOINT`

↓

`RETURN RESULT`

The Router determines whether an event belongs to the module.

The Router must not contain the module's business logic.

A module must not create its own Router.

---

## 8. Router registration

Every user-facing module must have an explicit route.

Examples:

`/admin`

`🤖 Поговорить с ИИ`

`⚙️ Фильтр поиска`

`👥 Найти собеседника`

or a callback/state route.

The route must lead to the module's public entrypoint.

A module that exists but has no registered route is considered:

`NOT INTEGRATED`

---

## 9. State-dependent modules

If a module receives ordinary messages only while the user is inside that module's state, Router must verify the current state before forwarding the message.

Example:

`main → aida`

Only after the user enters `aida` may ordinary messages be sent to AiDa.

AiDa must not receive unrelated messages from:

- main menu;
- Admin;
- Settings;
- Matchmaking;
- another module.

The same rule applies to every stateful module.

---

## 10. Menu and user interface

If a module requires a user-facing button, command, keyboard, callback, or menu item:

1. Create the UI entry.
2. Register its route in Router.
3. Connect the route to the module entrypoint.
4. Test the complete path.

The complete path must work:

`USER ACTION`

↓

`ROUTER`

↓

`MODULE`

↓

`HANDLER`

↓

`RESPONSE`

A visible button without a working route is an incomplete integration.

---

## 11. Index.js integration

`index.js` is the single application entrypoint.

A normal module does not need to be connected directly to `index.js`.

Use Router for normal user-facing modules.

`index.js` is modified only when the module requires root-level lifecycle integration such as:

- startup initialization;
- scheduler;
- webhook;
- process listener;
- background worker;
- another explicitly justified application-level service.

Do not add module business logic to `index.js`.

---

## 12. Shared services

Modules must use existing shared infrastructure where appropriate.

Examples:

- database;
- configuration;
- OpenRouter client;
- logging;
- application services.

Do not duplicate shared infrastructure inside a module unless explicitly required by the architecture.

A module owns its domain logic.

Shared infrastructure remains shared.

---

## 13. Replacing an old module

When replacing an existing implementation:

`CREATE NEW`

↓

`INDEPENDENT VERIFY`

↓

`REGISTER NEW`

↓

`INTEGRATE NEW`

↓

`VERIFY NEW`

↓

`REMOVE OLD`

↓

`SEARCH OLD REFERENCES`

↓

`VERIFY NO DUPLICATE`

↓

`COMMIT`

↓

`DEPLOY`

↓

`PRODUCTION TEST`

The old implementation must not remain active alongside the new implementation.

---

## 14. Old implementation removal

After successful integration, search for:

- imports of the old module;
- calls to the old handler;
- old Router registrations;
- old menu entries;
- old callbacks;
- old services;
- old character definitions;
- old memory systems;
- old configuration references.

Remove obsolete active references.

Do not delete architectural reference documents merely because they are not runtime code.

---

## 15. Verification after integration

After connecting the module, verify:

1. The application starts.
2. The Router loads.
3. The module loads.
4. The user entrypoint works.
5. The module receives only its own events.
6. Other modules still receive their events.
7. Navigation still works.
8. The old implementation is no longer active.
9. No duplicate handler exists.
10. Production behavior is correct.

A deployment that merely starts successfully is not sufficient.

---

## 16. Commit

Only after successful verification:

`git commit`

The commit must represent a complete architectural step.

Do not commit half-integrated modules.

Do not commit a new module while the old implementation is still active unless the architecture explicitly requires temporary coexistence.

---

## 17. Deploy

After commit:

`DEPLOY`

Do not treat deployment as verification.

Deployment only puts the verified commit into the target environment.

---

## 18. Production test

After deployment:

`TEST REAL USER FLOW`

Test the actual entrypoint from the user's perspective.

Example:

`button → Router → module → response`

For a stateful module:

`enter module → send ordinary message → module response → leave module → ordinary message no longer reaches module`

---

## 19. Definition of integrated module

A module is officially integrated only when all conditions are true:

- module exists in `modules/`;
- public entrypoint exists;
- independent verification passed;
- Router registration exists when required;
- UI/command/callback registration exists when required;
- Index integration exists only when required;
- module receives only its intended events;
- old implementation is removed from active flow;
- duplicate implementation is absent;
- commit exists;
- deployment succeeded;
- production test succeeded.

Only then is the module:

`INTEGRATED`

---

## 20. Standard command sequence

For normal module development, the project owner should receive commands in this order:

### STEP 1

Create the module files.

### STEP 2

Insert the module implementation.

### STEP 3

Independently verify the module.

### STEP 4

Connect the public entrypoint.

### STEP 5

Connect Router.

### STEP 6

Connect Menu / Command / Button / Callback if required.

### STEP 7

Connect Index only if required.

### STEP 8

Remove the old implementation.

### STEP 9

Verify the complete application flow.

### STEP 10

Commit.

### STEP 11

Deploy.

### STEP 12

Test production.

The assistant must determine the exact commands required for each step before instructing the project owner.

---

## 21. Communication rule

The project owner should normally receive only the next required action.

Do not give a long sequence of unrelated commands when they can be performed one at a time.

Example:

`Create file X.`

After confirmation:

`Insert code.`

After confirmation:

`Run verification.`

After confirmation:

`Connect Router.`

This keeps the implementation controlled and prevents accidental changes.

---

## 22. Architecture exception

If a module cannot follow this standard because the existing architecture is insufficient:

STOP.

Do not improvise.

The assistant must first propose the required architecture change.

The change must be approved and documented before implementation continues.

---

## 23. Final rule

The module creation process is standardized.

The module's internal implementation may differ according to its responsibility.

The integration process does not change.

The permanent rule is:

**CREATE → VERIFY → REGISTER → INTEGRATE → REMOVE OLD → VERIFY → COMMIT → DEPLOY → TEST**

This is the standard operating procedure for every future SecretTalk module.
