# SECRET TALK — PROJECT DEVELOPMENT CONSTITUTION

## Purpose

This constitution defines the mandatory way SecretTalk is developed and changed.

It exists to prevent repeated architecture rediscovery, duplicate implementations, accidental legacy code, uncontrolled changes, and ad-hoc integration.

This document governs development work. It does not belong to the runtime application and must never become runtime business logic.

---

## 1. Single source of architectural truth

Before changing architecture or application flow, the current project architecture and development protocol must be consulted.

Existing documentation must not be silently replaced by a new interpretation.

If two architectural documents conflict, stop and resolve the conflict before changing code.

No developer or AI assistant may invent a new integration pattern when an approved project standard already exists.

---

## 2. Mandatory preflight

Before creating, replacing, moving, or deleting code, determine:

1. What function is being changed or created.
2. Which module owns that function.
3. Whether an existing implementation already performs it.
4. What the module's public entry point is.
5. Which application entry layer reaches it.
6. Whether a user-facing entry point exists.
7. Which files must be created.
8. Which files must be modified.
9. Which old implementation must be removed.
10. What must be verified before commit.

Do not begin implementation by random searching or editing.

---

## 3. One module, one responsibility

Every functional area has one authoritative module.

A new module must not duplicate an existing functional module.

Shared infrastructure belongs to shared infrastructure layers and must not be copied into individual modules without an explicit architectural decision.

A module must contain its own domain-specific logic, state handling, and public interface.

---

## 4. Standard module lifecycle

Every new or replacement module follows this exact lifecycle:

CREATE
→ INDEPENDENT VERIFY
→ REGISTER ENTRYPOINT
→ INTEGRATE
→ VERIFY INTEGRATION
→ REMOVE OLD IMPLEMENTATION
→ VERIFY AGAIN
→ COMMIT
→ DEPLOY
→ TEST

No stage may be silently skipped.

A module is not considered complete until production testing succeeds.

---

## 5. Single application entrypoint

The root `index.js` is the single application entrypoint.

Modules must not create their own application entrypoints.

`index.js` must remain a thin orchestrator and must not accumulate business logic.

Normal user-facing modules are reached through the main Router.

`index.js` may directly integrate a module only when that module requires root-level lifecycle integration such as startup registration, scheduler, webhook, process listener, or another explicitly justified system-level mechanism.

---

## 6. Single Router

`router.js` is the single application Router for user-driven actions.

Modules must not create parallel Routers.

A module does not route other modules directly.

The Router determines which module receives a user event and forwards the event to that module's public entrypoint.

The Router must not contain the business logic of the modules it routes.

As the Router grows, routing responsibilities may be extracted into approved helper components, but there remains one authoritative routing system.

---

## 7. User entrypoints are mandatory

Every user-facing module must have its entrypoint explicitly registered.

A user-facing entrypoint may be:

- command;
- keyboard button;
- callback;
- message;
- state/screen transition;
- another documented user event.

Creating a button without registering its route is incomplete.

Creating a handler without registering its user entrypoint is incomplete.

A module is considered connected only when the complete path works:

USER ACTION → ROUTER → MODULE → HANDLER → RESPONSE

---

## 8. Module state

Each module owns its internal state.

The Router may maintain global navigation state required to route users, but it must not contain the internal business state of individual modules.

One module must not directly mutate another module's internal state.

Communication between modules must use documented public interfaces.

---

## 9. Replacement rule

When replacing an existing implementation:

1. Create the new implementation.
2. Verify it independently.
3. Register and integrate it.
4. Verify the new route.
5. Remove the old implementation from the active application flow.
6. Search for remaining active references to the old implementation.
7. Verify that no duplicate implementation remains active.
8. Commit.
9. Deploy.
10. Test.

The old and new implementations must never remain active simultaneously for the same responsibility.

---

## 10. No architecture by guessing

If the required integration point is unclear, do not guess.

Stop and determine the architecture first.

If the existing architecture cannot express the required feature, propose an explicit architecture change before implementing the feature.

An architecture change must be deliberate, documented, and applied consistently.

---

## 11. AI assistant development protocol

When an AI assistant works on SecretTalk, it must follow this constitution before giving implementation commands.

The assistant must:

1. Read the applicable architectural rules.
2. Determine the current owner of the requested function.
3. Determine the existing entrypoint and integration path.
4. Produce the migration/integration plan before editing.
5. Give the user only the next clear action unless multiple actions are explicitly required.
6. Never repeatedly rediscover an already established project rule.
7. Never create a parallel implementation merely because an old implementation is inconvenient.
8. Never add business logic to `index.js` merely to make a feature work.
9. Never connect a module without registering its user-facing entrypoint when one exists.
10. Never leave an old implementation active after successful migration.
11. Verify before commit.
12. Treat commit, deploy, and production test as separate stages.

If the assistant discovers that the current code contradicts the constitution, it must identify the contradiction before making unrelated changes.

---

## 12. Communication protocol with the project owner

Implementation instructions must be short, sequential, and concrete.

The assistant should normally provide one next command at a time.

The assistant must not repeatedly explain what the user already understands unless clarification is necessary.

If a destructive action is required, the assistant must identify exactly what is being removed and why before giving the command.

Do not ask the user to perform architecture analysis that the assistant can determine from the repository.

---

## 13. Verification standard

Verification must cover the smallest useful scope first.

For a new module:

MODULE LOAD
→ CORE FUNCTION
→ ENTRYPOINT
→ ROUTER
→ USER FLOW

For a replacement:

NEW IMPLEMENTATION
→ NEW ROUTE
→ OLD ROUTE ABSENT
→ NO DUPLICATE HANDLER
→ USER FLOW

A successful deployment alone is not proof that the integration is correct.

---

## 14. Repository cleanliness

Files are not considered active merely because they exist in the repository.

Every significant implementation must have an identifiable owner and integration path.

Unused, duplicate, obsolete, or superseded code must be classified before deletion.

Do not delete legacy code blindly.

First determine whether it is:

- active;
- referenced;
- architectural reference material;
- obsolete.

---

## 15. Architecture governance

This constitution is the development-level contract.

The future Architecture Governance Layer will enforce machine-checkable parts of this contract.

The governance system should eventually verify at minimum:

- single application entrypoint;
- single main Router;
- module location;
- module registration;
- required user entrypoints;
- duplicate implementations;
- unresolved module references;
- forbidden business logic in `index.js`;
- active legacy references;
- integration completeness.

Until automated governance exists, this constitution remains mandatory for human and AI development work.

---

## 16. Definition of done

A change is complete only when:

ARCHITECTURE PREFLIGHT
→ PLAN
→ IMPLEMENT
→ INDEPENDENT VERIFY
→ INTEGRATE
→ REMOVE OLD
→ VERIFY
→ COMMIT
→ DEPLOY
→ PRODUCTION TEST

has been completed.

If one of these required stages has not been completed, the work is not finished.

---

## 17. Priority rule

When convenience conflicts with architecture, architecture wins.

When speed conflicts with verification, verification wins.

When an old implementation conflicts with the new approved implementation after successful migration, the old implementation is removed.

When documentation conflicts with executable reality, the conflict must be resolved explicitly; neither side may be silently ignored.

---

## 18. Final principle

SecretTalk is built as one application with one entrypoint, one routing system, clear module ownership, explicit integration points, and controlled replacement of legacy implementations.

The purpose of this constitution is simple:

**We do not rediscover how SecretTalk should be built every time we build something new.**

We establish the rule once, follow it consistently, verify it, and progressively automate its enforcement.
