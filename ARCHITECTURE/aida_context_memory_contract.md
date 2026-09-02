# AiDa — Context + Memory Contract

## 1. Status

**Status:** APPROVED ARCHITECTURAL CONTRACT

**Scope:** AiDa only.

**Current branch:** `dev`

This document defines the authoritative contract for AiDa conversation context and long-term memory.

## 2. Objective

AiDa must be able to conduct a continuous conversation while preserving a clear separation between:

- character identity;
- current conversation context;
- long-term user memory;
- AI provider transport.

There must be one authoritative owner for each responsibility.

## 3. Authoritative ownership

### 3.1 Character identity

Owner:

`modules/aida/aida.system.md`

This is the only authoritative source of AiDa's identity, personality, behavioral rules and system-level character instructions.

### 3.2 AiDa module logic

Owner:

`modules/aida/aida.js`

The AiDa module owns the orchestration of its own context and memory use and exposes the public module interface to Router.

### 3.3 Long-term memory

Owner:

`modules/aida/aida.memory.js`

This is the authoritative persistence interface for AiDa long-term memory.

The database is storage infrastructure; it is not an alternative memory owner.

### 3.4 Conversation context

Owner:

**AiDa context layer.**

The context layer is responsible for assembling the information required for one model request.

Existing legacy `ContextBuilder` must not become an implicit owner of AiDa context.

### 3.5 AI transport

Owner:

`ai/openrouter.client.js`

The transport layer sends the prepared request to the provider.

It must not define AiDa's identity, memory policy or conversation semantics.

## 4. Authoritative request flow

The target AiDa request flow is:

`USER MESSAGE`

→ `ROUTER`

→ `AIDA MODULE`

→ `LOAD LONG-TERM MEMORY`

→ `BUILD CONVERSATION CONTEXT`

→ `AI TRANSPORT`

→ `MODEL`

→ `AIDA RESPONSE`

→ `MEMORY UPDATE DECISION`

→ `SAVE APPROVED MEMORY`

→ `RESPONSE TO USER`

The exact implementation may be modularized, but responsibility boundaries must remain unchanged.

## 5. Context contract

For every normal AiDa model request, the context must be composed from four logical sources:

1. **Character** — authoritative contents of `aida.system.md`.
2. **Long-term memory** — memory explicitly stored for this Telegram user through `aida.memory.js`.
3. **Conversation state/history** — the relevant current dialogue turns required for continuity.
4. **Current user message** — the new message being answered.

No other source may silently inject identity, user facts or conversation state.

## 6. Context ordering

The logical priority is:

`CHARACTER IDENTITY`

→ `MEMORY`

→ `CONVERSATION HISTORY`

→ `CURRENT USER MESSAGE`

Character rules remain authoritative.

Memory and conversation history provide context but cannot redefine AiDa's identity or system rules.

## 7. Conversation history

Conversation history is **not** the same thing as long-term memory.

Conversation history exists to maintain short-term continuity within the dialogue.

Long-term memory exists to preserve selected user facts beyond the immediate conversation context.

The implementation must not treat the entire conversation transcript as permanent memory.

The implementation must not require the entire historical transcript to be placed into every request when a bounded relevant context is sufficient.

## 8. Memory contract

AiDa memory is persistent user-specific information stored through:

`modules/aida/aida.memory.js`

Current storage contract:

`user_memory.telegram_id` identifies the user.

`user_memory.memory` stores the JSONB memory object.

Only approved memory may be written.

## 9. What may become long-term memory

Information may be stored when it is:

- explicitly stated by the user;
- stable enough to remain useful beyond the current message;
- relevant to future interaction;
- sufficiently clear to avoid treating an assumption as a fact.

Examples include a user's preferred name, a clearly stated preference, a persistent project or goal, or another explicitly provided fact that is useful later.

## 10. What must not become memory

The memory system must not persist:

- guesses about the user;
- model-generated assumptions presented as facts;
- temporary conversational filler;
- every ordinary message automatically;
- internal reasoning;
- hidden system instructions;
- provider responses as if they were user facts.

When confidence is insufficient, the information remains conversation context rather than long-term memory.

## 11. Memory update policy

Memory update is a separate decision from generating a response.

The model response itself does not automatically become memory.

The system must first determine whether a candidate fact is eligible for persistent storage according to this contract.

Only then may the approved fact be written through `aida.memory.js`.

## 12. Memory isolation

AiDa must not use another memory implementation as a parallel owner of the same AiDa memory function.

In particular, the following legacy components must not be silently reintroduced into the AiDa memory flow:

- `memory/memory.service.js`;
- `memory/memory.engine.js`.

If either is ever required, that requires a separate architectural decision and migration step.

## 13. Context isolation

AiDa must not silently use the legacy:

`ai/context.builder.js`

as a second context owner.

If its functionality is needed, it must first be evaluated and explicitly adopted or replaced.

There must remain exactly one authoritative context-building responsibility for AiDa.

## 14. Memory schema principle

The initial memory format remains intentionally flexible JSONB.

The first implementation must not introduce a complex memory taxonomy unless a demonstrated product requirement requires it.

When structured keys are used, they must represent stable user facts rather than transient dialogue state.

## 15. Error behavior

Failure to load long-term memory must not silently fabricate memory.

Failure to save memory must not rewrite the user's current message or character identity.

Provider failure and memory failure are separate failure domains and must remain distinguishable in logs and diagnostics.

## 16. Security and privacy boundary

Long-term memory belongs to the individual Telegram user identified by `telegram_id`.

Memory from one user must never enter another user's context.

Internal implementation details of memory must not be disclosed to the user unless explicitly required by a product-level privacy feature.

## 17. Current implementation gap

The current `modules/aida/aida.js` loads long-term memory but sends only the system message and the current user message to the model.

Conversation history is therefore not yet part of the authoritative AiDa request context.

The current `modules/aida/aida.memory.js` provides `load`, `save`, `remember` and `forget`, but the normal AiDa response flow does not yet perform an approved automatic memory-update step.

These are implementation gaps against this contract.

They are not reasons to create parallel legacy infrastructure.

## 18. Explicit non-goals of this contract

This contract does not authorize or define:

- Agent Orchestrator;
- Tools;
- Permission/Safety Layer;
- autonomous actions;
- voice or multimodal processing;
- Presence Engine;
- Relationship Engine;
- vector database;
- semantic search;
- automatic summarization architecture;
- migration or deletion of legacy files.

Those subjects remain separate architectural stages.

## 19. Acceptance criteria for implementation

This contract is considered implemented only when all of the following are verified:

1. AiDa continues to use `aida.system.md` as its only character source.
2. AiDa loads user-specific long-term memory through `aida.memory.js`.
3. Relevant conversation history is included in the model context.
4. Conversation history and long-term memory remain separate concepts.
5. Approved memory can be persisted through `aida.memory.js`.
6. Unapproved assumptions are not persisted as facts.
7. No legacy `ContextBuilder`, `MemoryService` or `MemoryEngine` is silently involved in the AiDa flow.
8. Router → AiDa integration remains intact.
9. A real multi-turn Telegram dialog demonstrates continuity.
10. A separate dialog demonstrates that a stored long-term fact is available in a later request.
11. A separate verification confirms that one user's memory cannot leak into another user's context.
12. Tests pass before commit and deployment.

## 20. Completion rule

Until all acceptance criteria above are verified, the stage remains:

**IN PROGRESS**

No unrelated architectural improvement may replace this stage.

The next implementation stage is limited to closing the gaps identified in section 17 while preserving all ownership boundaries defined in this contract.
