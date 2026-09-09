/**
 * SecretTalk
 * Nika v1.0
 *
 * Runtime / Orchestrator
 *
 * Architecture:
 *
 * Persona Layer
 *      ↓
 * Nika Runtime
 *      ├── Relationship State
 *      ├── Consent State
 *      ├── Interaction Mode
 *      ├── Initiative Engine
 *      ├── Safety Gate
 *      └── Conversation / Memory
 *              ↓
 *           Nika AI
 *
 * Responsibility:
 * - orchestrate Nika runtime;
 * - maintain runtime state;
 * - determine conversational initiative;
 * - enforce state transitions;
 * - prepare context for AI;
 * - maintain conversation history.
 *
 * This module does NOT:
 * - define Nika's personality;
 * - implement the AI provider;
 * - replace the Persona Layer;
 * - invent memories;
 * - override application/platform safety.
 */

const fs = require("fs");
const path = require("path");

const nikaAI = require("./nika.ai");
const nikaConversation = require("./nika.conversation");
const permissions = require("../admin/permissions");


class Nika {

    constructor() {

        this.name = "Nika";

        this.systemPromptPath = path.join(
            __dirname,
            "nika.system.md"
        );

        this.systemPrompt =
            fs.readFileSync(
                this.systemPromptPath,
                "utf-8"
            );

        /*
         * Runtime states.
         *
         * These values are deliberately explicit.
         * They are NOT part of Persona Layer.
         */

        this.RELATIONSHIP_STATES = Object.freeze({
            NEW: "NEW",
            ACQUAINTED: "ACQUAINTED",
            FAMILIAR: "FAMILIAR",
            CLOSE: "CLOSE"
        });

        this.CONSENT_STATES = Object.freeze({
            UNKNOWN: "UNKNOWN",
            GRANTED: "GRANTED",
            DECLINED: "DECLINED",
            REVOKED: "REVOKED"
        });

        this.INTERACTION_MODES = Object.freeze({
            NEUTRAL: "NEUTRAL",
            FRIENDLY: "FRIENDLY",
            PLAYFUL: "PLAYFUL",
            ROMANTIC: "ROMANTIC",
            ADULT_ORIENTED: "ADULT_ORIENTED"
        });

        /*
         * Initiative actions.
         *
         * The engine selects the conversational behavior.
         * Persona Layer determines how Nika expresses it.
         */

        this.INITIATIVE_ACTIONS = Object.freeze({
            ANSWER: "ANSWER",
            CONTINUE: "CONTINUE",
            REACT: "REACT",
            TEASE: "TEASE",
            FLIRT: "FLIRT",
            SUGGEST: "SUGGEST",
            ASK: "ASK",
            CHANGE_TOPIC: "CHANGE_TOPIC",
            DEESCALATE: "DEESCALATE",
            STOP: "STOP"
        });

        console.log("✅ Nika initialized");
        console.log(
            "🌶️ Nika character:",
            this.systemPromptPath
        );
    }


    /**
     * Return a fresh default runtime state.
     */
    createDefaultRuntimeState() {

        return {
            relationshipState:
                this.RELATIONSHIP_STATES.NEW,

            consentState:
                this.CONSENT_STATES.UNKNOWN,

            interactionMode:
                this.INTERACTION_MODES.NEUTRAL,

            adultVerified: false,

            lastInitiativeAction:
                null,

            lastActivityAt:
                null
        };
    }


    /**
     * Get runtime state.
     */
    getRuntimeState(userId) {

        return nikaConversation.getState(
            userId
        );
    }


    /**
     * Normalize state values.
     */
    normalizeRuntimeState(state) {

        const defaults =
            this.createDefaultRuntimeState();

        return {
            ...defaults,
            ...(state || {})
        };
    }


    /**
     * Determine whether an interaction mode
     * is available under the current runtime state.
     *
     * Adult verification and consent are independent.
     */
    isModeAllowed(state, mode) {

        const normalized =
            this.normalizeRuntimeState(state);

        if (
            mode ===
            this.INTERACTION_MODES.ADULT_ORIENTED
        ) {

            return (
                normalized.adultVerified === true &&
                normalized.consentState ===
                    this.CONSENT_STATES.GRANTED
            );
        }

        if (
            mode ===
            this.INTERACTION_MODES.ROMANTIC
        ) {

            return (
                normalized.consentState !==
                this.CONSENT_STATES.DECLINED &&
                normalized.consentState !==
                this.CONSENT_STATES.REVOKED
            );
        }

        return true;
    }


    /**
     * Apply a controlled interaction-mode transition.
     *
     * Persona cannot call this directly.
     */
    setInteractionMode(userId, requestedMode) {

        const state =
            this.normalizeRuntimeState(
                this.getRuntimeState(userId)
            );

        const modes =
            Object.values(
                this.INTERACTION_MODES
            );

        if (!modes.includes(requestedMode)) {
            return state;
        }

        if (
            !this.isModeAllowed(
                state,
                requestedMode
            )
        ) {

            return {
                ...state,
                interactionMode:
                    this.INTERACTION_MODES.NEUTRAL
            };
        }

        return nikaConversation.updateState(
            userId,
            {
                interactionMode:
                    requestedMode
            }
        );
    }


    /**
     * Set adult verification supplied by the application.
     *
     * This does NOT grant consent.
     */
    setAdultVerification(
        userId,
        verified
    ) {

        return nikaConversation.updateState(
            userId,
            {
                adultVerified:
                    Boolean(verified)
            }
        );
    }


    /**
     * Set consent state.
     *
     * Consent can be granted, declined or revoked.
     *
     * Revocation immediately de-escalates
     * the interaction mode.
     */
    setConsentState(
        userId,
        consentState
    ) {

        const allowed =
            Object.values(
                this.CONSENT_STATES
            );

        if (!allowed.includes(consentState)) {
            throw new Error(
                `Nika: invalid consent state "${consentState}"`
            );
        }

        const patch = {
            consentState
        };

        if (
            consentState ===
                this.CONSENT_STATES.DECLINED ||
            consentState ===
                this.CONSENT_STATES.REVOKED
        ) {

            patch.interactionMode =
                this.INTERACTION_MODES.NEUTRAL;
        }

        return nikaConversation.updateState(
            userId,
            patch
        );
    }


    /**
     * Controlled relationship transition.
     *
     * Relationship state is derived from interaction
     * history and runtime logic, not invented by Persona.
     */
    setRelationshipState(
        userId,
        relationshipState
    ) {

        const allowed =
            Object.values(
                this.RELATIONSHIP_STATES
            );

        if (!allowed.includes(relationshipState)) {
            throw new Error(
                `Nika: invalid relationship state "${relationshipState}"`
            );
        }

        return nikaConversation.updateState(
            userId,
            {
                relationshipState
            }
        );
    }


    /**
     * Basic relationship progression.
     *
     * This deliberately progresses conservatively.
     */
    updateRelationshipAfterMessage(
        userId
    ) {

        const state =
            this.normalizeRuntimeState(
                this.getRuntimeState(userId)
            );

        const history =
            nikaConversation.getHistory(
                userId
            );

        const messageCount =
            history.length;

        let nextState =
            state.relationshipState;

        if (
            messageCount >= 30
        ) {

            nextState =
                this.RELATIONSHIP_STATES.CLOSE;

        } else if (
            messageCount >= 15
        ) {

            nextState =
                this.RELATIONSHIP_STATES.FAMILIAR;

        } else if (
            messageCount >= 3
        ) {

            nextState =
                this.RELATIONSHIP_STATES.ACQUAINTED;
        }

        if (
            nextState !==
            state.relationshipState
        ) {

            return this.setRelationshipState(
                userId,
                nextState
            );
        }

        return state;
    }


    /**
     * Detect explicit user requests to stop
     * or de-escalate an interaction.
     *
     * This is a safety-oriented runtime signal,
     * not a content classifier.
     */
    detectDeescalationSignal(
        userMessage
    ) {

        const text =
            String(userMessage)
                .trim()
                .toLowerCase();

        const stopPatterns = [
            "стоп",
            "хватит",
            "прекрати",
            "не хочу",
            "не надо",
            "остановись",
            "давай без этого",
            "не продолжай",

            "stop",
            "enough",
            "don't",
            "do not",
            "leave it",
            "stop that",

            "dayan",
            "dayanmaq",
            "istəmirəm",
            "istəmirəm bunu",
            "yetər",

            "dur",
            "istemiyorum",
            "yeter"
        ];

        return stopPatterns.some(
            pattern =>
                text === pattern ||
                text.includes(
                    ` ${pattern} `
                ) ||
                text.startsWith(
                    `${pattern} `
                ) ||
                text.endsWith(
                    ` ${pattern}`
                )
        );
    }


    /**
     * Detect an explicit request to change topic.
     */
    detectTopicChangeSignal(
        userMessage
    ) {

        const text =
            String(userMessage)
                .trim()
                .toLowerCase();

        const patterns = [
            "давай о другом",
            "сменим тему",
            "поговорим о другом",
            "давай другую тему",

            "change the subject",
            "different topic",
            "let's talk about something else",

            "başqa mövzu",
            "mövzunu dəyiş",

            "başka konu",
            "konuyu değiştirelim"
        ];

        return patterns.some(
            pattern =>
                text.includes(pattern)
        );
    }


    /**
     * Initiative Engine.
     *
     * It determines WHAT conversational action
     * should happen.
     *
     * Persona Layer determines HOW Nika expresses it.
     */
    determineInitiative(
        userId,
        userMessage,
        state
    ) {

        const normalized =
            this.normalizeRuntimeState(
                state
            );

        if (
            this.detectDeescalationSignal(
                userMessage
            )
        ) {

            return this.INITIATIVE_ACTIONS.DEESCALATE;
        }

        if (
            this.detectTopicChangeSignal(
                userMessage
            )
        ) {

            return this.INITIATIVE_ACTIONS.CHANGE_TOPIC;
        }

        if (
            normalized.consentState ===
                this.CONSENT_STATES.DECLINED ||
            normalized.consentState ===
                this.CONSENT_STATES.REVOKED
        ) {

            return this.INITIATIVE_ACTIONS.ANSWER;
        }

        /*
         * Do not force questions.
         *
         * Clear conversational signals prefer
         * ANSWER / CONTINUE / REACT.
         */

        const text =
            String(userMessage)
                .trim();

        if (
            text.endsWith("?") ||
            text.endsWith("？")
        ) {

            return this.INITIATIVE_ACTIONS.ANSWER;
        }

        if (
            text.length < 20
        ) {

            return this.INITIATIVE_ACTIONS.REACT;
        }

        /*
         * Longer messages normally benefit from
         * continuation rather than immediately returning
         * control to the user.
         */

        return this.INITIATIVE_ACTIONS.CONTINUE;
    }


    /**
     * Build runtime instructions for the model.
     *
     * This does not replace Persona.
     */
    buildRuntimeInstructions(
        state,
        initiativeAction
    ) {

        const normalized =
            this.normalizeRuntimeState(
                state
            );

        return [
            "",
            "=== NIKA RUNTIME STATE ===",
            `Relationship State: ${normalized.relationshipState}`,
            `Consent State: ${normalized.consentState}`,
            `Interaction Mode: ${normalized.interactionMode}`,
            `Adult Verification: ${
                normalized.adultVerified
                    ? "confirmed"
                    : "not confirmed"
            }`,
            `Initiative Action: ${initiativeAction}`,
            "",
            "RUNTIME RULES:",
            "- Follow the supplied runtime state.",
            "- Do not invent consent.",
            "- Do not upgrade consent automatically.",
            "- Do not invent adult verification.",
            "- Do not upgrade relationship state yourself.",
            "- Do not override application safety restrictions.",
            "- If the user clearly asks to stop, de-escalate.",
            "- Do not end every response with a question.",
            "- When user intent is already clear, continue naturally.",
            "- Questions are for genuine conversational purposes, not for mechanically returning control to the user.",
            "- Keep the response consistent with the selected initiative action.",
            "=== END NIKA RUNTIME STATE ==="
        ].join("\n");
    }


    /**
     * Build memory instructions.
     */
    buildMemoryInstructions(
        memory
    ) {

        if (
            !memory ||
            typeof memory !== "object"
        ) {

            return "";
        }

        const sections = [];

        const categories = [
            ["facts", "Known Facts"],
            ["preferences", "Preferences"],
            [
                "interactionPreferences",
                "Interaction Preferences"
            ],
            [
                "relationshipNotes",
                "Relationship Notes"
            ],
            [
                "importantEvents",
                "Important Events"
            ]
        ];

        for (
            const [key, title]
            of categories
        ) {

            const entries =
                Array.isArray(memory[key])
                    ? memory[key]
                    : [];

            if (!entries.length) {
                continue;
            }

            const values =
                entries
                    .map(entry => {

                        if (
                            entry &&
                            typeof entry ===
                                "object" &&
                            entry.value !==
                                undefined
                        ) {

                            return String(
                                entry.value
                            );
                        }

                        return String(entry);
                    })
                    .filter(Boolean);

            if (!values.length) {
                continue;
            }

            sections.push(
                `${title}:\n- ${values.join(
                    "\n- "
                )}`
            );
        }

        if (!sections.length) {
            return "";
        }

        return [
            "",
            "=== NIKA MEMORY ===",
            ...sections,
            "",
            "Use memory only when relevant.",
            "Never invent memories.",
            "Never claim to remember information that is not present.",
            "=== END NIKA MEMORY ==="
        ].join("\n");
    }


    /**
     * Build the effective system prompt.
     *
     * Persona remains the source of character behavior.
     * Runtime state is appended as application context.
     */
    buildEffectiveSystemPrompt(
        context,
        initiativeAction
    ) {

        const runtimeInstructions =
            this.buildRuntimeInstructions(
                context.state,
                initiativeAction
            );

        const memoryInstructions =
            this.buildMemoryInstructions(
                context.memory
            );

        return [
            this.systemPrompt.trim(),
            runtimeInstructions,
            memoryInstructions
        ]
            .filter(Boolean)
            .join("\n\n");
    }


    /**
     * Safety gate before generation.
     *
     * This does not attempt to replace platform safety.
     * It enforces application-level state
