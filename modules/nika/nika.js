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
 * Responsibilities:
 * - orchestrate Nika runtime;
 * - maintain runtime state;
 * - control state transitions;
 * - determine conversational initiative;
 * - enforce consent-aware interaction modes;
 * - prepare context for Nika AI;
 * - maintain conversation history;
 * - maintain relationship progression;
 * - connect Persona Layer with runtime state.
 *
 * This module does NOT:
 * - define Nika's personality;
 * - implement the AI provider;
 * - invent memories;
 * - invent consent;
 * - bypass application/platform safety.
 */

const fs = require("fs");
const path = require("path");

const nikaAI = require("./nika.ai");
const NikaConversation = require("./nika.conversation");


class Nika {

    constructor() {

        this.name = "Nika";

        /*
         * Persona Layer
         */
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
         * Relationship State
         */
        this.RELATIONSHIP_STATES = Object.freeze({
            NEW: "NEW",
            ACQUAINTED: "ACQUAINTED",
            FAMILIAR: "FAMILIAR",
            CLOSE: "CLOSE"
        });


        /*
         * Consent State
         */
        this.CONSENT_STATES = Object.freeze({
            UNKNOWN: "UNKNOWN",
            GRANTED: "GRANTED",
            DECLINED: "DECLINED",
            REVOKED: "REVOKED"
        });


        /*
         * Interaction Mode
         */
        this.INTERACTION_MODES = Object.freeze({
            NEUTRAL: "NEUTRAL",
            FRIENDLY: "FRIENDLY",
            PLAYFUL: "PLAYFUL",
            ROMANTIC: "ROMANTIC",
            ADULT_ORIENTED: "ADULT_ORIENTED"
        });


        /*
         * Initiative Engine actions.
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


        /*
         * IMPORTANT:
         *
         * nika.conversation.js exports a CLASS.
         *
         * We therefore create exactly one conversation
         * runtime instance here.
         *
         * This fixes the architecture mismatch that caused
         * the previous getMessages() failure.
         */
        this.conversation =
            new NikaConversation();


        console.log("✅ Nika initialized");
        console.log(
            "🌶️ Nika character:",
            this.systemPromptPath
        );
    }


    /*
     * =========================================================
     * DEFAULT STATE
     * =========================================================
     */

    createDefaultRuntimeState() {

        return {

            relationshipState:
                this.RELATIONSHIP_STATES.NEW,

            consentState:
                this.CONSENT_STATES.UNKNOWN,

            interactionMode:
                this.INTERACTION_MODES.NEUTRAL,

            adultVerified:
                false,

            lastInitiativeAction:
                null,

            lastActivityAt:
                null,

            metadata:
                {}
        };
    }


    /*
     * =========================================================
     * STATE ACCESS
     * =========================================================
     */

    getRuntimeState(userId) {

        return this.conversation.getState(
            userId
        );
    }


    normalizeRuntimeState(state) {

        const defaults =
            this.createDefaultRuntimeState();

        return {

            ...defaults,

            ...(state || {}),

            metadata: {
                ...defaults.metadata,
                ...((state && state.metadata) || {})
            }
        };
    }


    /*
     * =========================================================
     * INTERACTION MODE
     * =========================================================
     */

    isModeAllowed(state, mode) {

        const normalized =
            this.normalizeRuntimeState(
                state
            );


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


    setInteractionMode(
        userId,
        requestedMode
    ) {

        const state =
            this.normalizeRuntimeState(
                this.getRuntimeState(userId)
            );


        const allowedModes =
            Object.values(
                this.INTERACTION_MODES
            );


        if (
            !allowedModes.includes(
                requestedMode
            )
        ) {

            return state;
        }


        if (
            !this.isModeAllowed(
                state,
                requestedMode
            )
        ) {

            return this.conversation.updateState(
                userId,
                {
                    interactionMode:
                        this.INTERACTION_MODES.NEUTRAL
                }
            );
        }


        return this.conversation.updateState(
            userId,
            {
                interactionMode:
                    requestedMode
            }
        );
    }


    /*
     * =========================================================
     * ADULT VERIFICATION
     * =========================================================
     *
     * Verification and consent are deliberately separate.
     */

    setAdultVerification(
        userId,
        verified
    ) {

        return this.conversation.updateState(
            userId,
            {
                adultVerified:
                    Boolean(verified)
            }
        );
    }


    /*
     * =========================================================
     * CONSENT STATE
     * =========================================================
     */

    setConsentState(
        userId,
        consentState
    ) {

        const allowed =
            Object.values(
                this.CONSENT_STATES
            );


        if (
            !allowed.includes(
                consentState
            )
        ) {

            throw new Error(
                `Nika: invalid consent state "${consentState}"`
            );
        }


        const patch = {
            consentState
        };


        /*
         * Declined / revoked consent immediately
         * returns the interaction to NEUTRAL.
         */
        if (
            consentState ===
                this.CONSENT_STATES.DECLINED ||
            consentState ===
                this.CONSENT_STATES.REVOKED
        ) {

            patch.interactionMode =
                this.INTERACTION_MODES.NEUTRAL;
        }


        return this.conversation.updateState(
            userId,
            patch
        );
    }


    /*
     * =========================================================
     * RELATIONSHIP STATE
     * =========================================================
     */

    setRelationshipState(
        userId,
        relationshipState
    ) {

        const allowed =
            Object.values(
                this.RELATIONSHIP_STATES
            );


        if (
            !allowed.includes(
                relationshipState
            )
        ) {

            throw new Error(
                `Nika: invalid relationship state "${relationshipState}"`
            );
        }


        return this.conversation.updateState(
            userId,
            {
                relationshipState
            }
        );
    }


    /*
     * Relationship progression is intentionally
     * conservative and based on conversation history.
     */

    updateRelationshipAfterMessage(
        userId
    ) {

        const state =
            this.normalizeRuntimeState(
                this.getRuntimeState(userId)
            );


        const history =
            this.conversation.getHistory(
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


    /*
     * =========================================================
     * SIGNAL DETECTION
     * =========================================================
     */

    detectDeescalationSignal(
        userMessage
    ) {

        const text =
            String(userMessage)
                .trim()
                .toLowerCase();


        const patterns = [

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
            "stop that",
            "leave it",

            "dayan",
            "dayanmaq",
            "istəmirəm",
            "istəmirəm bunu",
            "yetər",

            "dur",
            "istemiyorum",
            "yeter"
        ];


        return patterns.some(
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


    /*
     * =========================================================
     * INITIATIVE ENGINE
     * =========================================================
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


        /*
         * Safety / de-escalation has priority.
         */
        if (
            this.detectDeescalationSignal(
                userMessage
            )
        ) {

            return this.INITIATIVE_ACTIONS.DEESCALATE;
        }


        /*
         * Explicit topic change.
         */
        if (
            this.detectTopicChangeSignal(
                userMessage
            )
        ) {

            return this.INITIATIVE_ACTIONS.CHANGE_TOPIC;
        }


        /*
         * Declined/revoked consent means
         * no escalation.
         */
        if (
            normalized.consentState ===
                this.CONSENT_STATES.DECLINED ||
            normalized.consentState ===
                this.CONSENT_STATES.REVOKED
        ) {

            return this.INITIATIVE_ACTIONS.ANSWER;
        }


        const text =
            String(userMessage)
                .trim();


        /*
         * A direct question normally deserves
         * a direct answer.
         */
        if (
            text.endsWith("?") ||
            text.endsWith("？")
        ) {

            return this.INITIATIVE_ACTIONS.ANSWER;
        }


        /*
         * Short messages receive a natural reaction.
         */
        if (
            text.length < 20
        ) {

            return this.INITIATIVE_ACTIONS.REACT;
        }


        /*
         * Clear longer messages favor
         * conversational continuation.
         *
         * This is the important change:
         *
         * Nika does not automatically return
         * control to the user with a question.
         */
        return this.INITIATIVE_ACTIONS.CONTINUE;
    }


    /*
     * =========================================================
     * SAFETY GATE
     * =========================================================
     *
     * This is an APPLICATION state gate.
     *
     * It does not attempt to replace model/platform safety.
     */

    safetyGate(
        userId,
        userMessage,
        state,
        initiativeAction
    ) {

        const normalized =
            this.normalizeRuntimeState(
                state
            );


        /*
         * Explicit stop always wins.
         */
        if (
            this.detectDeescalationSignal(
                userMessage
            )
        ) {

            return {

                allowed: true,

                action:
                    this.INITIATIVE_ACTIONS.DEESCALATE,

                statePatch: {

                    interactionMode:
                        this.INTERACTION_MODES.NEUTRAL
                }
            };
        }


        /*
         * Adult-oriented mode requires both:
         *
         * 1. adult verification
         * 2. current consent
         */
        if (
            normalized.interactionMode ===
            this.INTERACTION_MODES.ADULT_ORIENTED
        ) {

            if (
                !this.isModeAllowed(
                    normalized,
                    this.INTERACTION_MODES.ADULT_ORIENTED
                )
            ) {

                return {

                    allowed: true,

                    action:
                        this.INITIATIVE_ACTIONS.DEESCALATE,

                    statePatch: {

                        interactionMode:
                            this.INTERACTION_MODES.NEUTRAL
                    }
                };
            }
        }


        return {

            allowed: true,

            action:
                initiativeAction,

            statePatch: null
        };
    }


    /*
     * =========================================================
     * RUNTIME INSTRUCTIONS
     * =========================================================
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

            `Relationship State: ${
                normalized.relationshipState
            }`,

            `Consent State: ${
                normalized.consentState
            }`,

            `Interaction Mode: ${
                normalized.interactionMode
            }`,

            `Adult Verification: ${
                normalized.adultVerified
                    ? "confirmed"
                    : "not confirmed"
            }`,

            `Initiative Action: ${
                initiativeAction
            }`,

            "",

            "RUNTIME RULES:",

            "- Follow the supplied runtime state.",

            "- Persona Layer defines Nika's character and communication style.",

            "- Initiative Engine defines the conversational action.",

            "- Do not invent consent.",

            "- Do not upgrade consent automatically.",

            "- Do not invent adult verification.",

            "- Do not upgrade relationship state yourself.",

            "- Do not override application or platform safety.",

            "- If the user clearly asks to stop, de-escalate.",

            "- Do not end every response with a question.",

            "- When user intent is already clear, continue naturally.",

            "- Questions are for genuine conversational purposes.",

            "- Do not mechanically return control to the user.",

            "- Preserve conversational momentum.",

            "- Follow the selected initiative action.",

            "=== END NIKA RUNTIME STATE ==="

        ].join("\n");
    }


    /*
     * =========================================================
     * MEMORY INSTRUCTIONS
     * =========================================================
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


            if (
                !entries.length
            ) {

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


            if (
                !values.length
            ) {

                continue;
            }


            sections.push(
                `${title}:\n- ${values.join(
                    "\n- "
                )}`
            );
        }


        if (
            !sections.length
        ) {

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


    /*
     * =========================================================
     * EFFECTIVE SYSTEM PROMPT
     * =========================================================
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


    /*
     * =========================================================
     * STATE PATCH
     * =========================================================
     */

    applyStatePatch(
        userId,
        patch
    ) {

        if (
            !patch ||
            typeof patch !== "object"
        ) {

            return this.getRuntimeState(
                userId
            );
        }


        return this.conversation.updateState(
            userId,
            patch
        );
    }


    /*
     * =========================================================
     * ASK
     * =========================================================
     *
     * Main runtime entry point for Nika AI.
     */

    async ask(
        userId,
        userMessage
    ) {

        if (
            userId === undefined ||
            userId === null
        ) {

            throw new Error(
                "Nika requires userId"
            );
        }


        if (
            !userMessage ||
            !String(userMessage).trim()
        ) {

            throw new Error(
                "Nika requires userMessage"
            );
        }


        const message =
            String(userMessage).trim();


        /*
         * Load complete runtime context.
         *
         * This replaces the old getMessages()
         * architecture.
         */
        const context =
            this.conversation.buildContext(
                userId
            );


        const state =
            this.normalizeRuntimeState(
                context.state
            );


        /*
         * Determine WHAT Nika should do.
         */
        const initiativeAction =
            this.determineInitiative(
                userId,
                message,
                state
            );


        /*
         * Safety gate.
         */
        const safety =
            this.safetyGate(
                userId,
                message,
                state,
                initiativeAction
            );


        /*
         * Apply any state change caused by
         * safety/de-escalation.
         */
        let effectiveState =
            state;


        if (
            safety.statePatch
        ) {

            effectiveState =
                this.applyStatePatch(
                    userId,
                    safety.statePatch
                );
        }


        /*
         * Record selected initiative action.
         */
        effectiveState =
            this.applyStatePatch(
                userId,
                {
                    lastInitiativeAction:
                        safety.action
                }
            );


        /*
         * Rebuild context after state changes.
         */
        const effectiveContext =
            this.conversation.buildContext(
                userId
            );


        /*
         * Build final system prompt.
         */
        const effectiveSystemPrompt =
            this.buildEffectiveSystemPrompt(
                {
                    ...effectiveContext,
                    state:
                        effectiveState
                },
                safety.action
            );


        /*
         * Conversation history:
         *
         * Existing history +
         * current user message.
         *
         * The current message is NOT saved until
         * generation succeeds.
         */
        const conversationMessages = [

            ...effectiveContext.conversation,

            {
                role: "user",
                content: message
            }

        ];


        /*
         * Generate Nika response.
         */
        const answer =
            await nikaAI.generate(
                effectiveSystemPrompt,
                conversationMessages
            );


        /*
         * Save the successful exchange.
         */
        this.conversation.addUserMessage(
            userId,
            message
        );


        this.conversation.addAssistantMessage(
            userId,
            answer,
            {
                initiativeAction:
                    safety.action,

                interactionMode:
                    effectiveState.interactionMode
            }
        );


        /*
         * Update relationship state AFTER
         * successful conversation.
         */
        const relationshipState =
            this.updateRelationshipAfterMessage(
                userId
            );


        /*
         * Update activity timestamp.
         */
        this.conversation.touch(
            userId
        );


        return answer;
    }


    /*
     * =========================================================
     * TELEGRAM HANDLER
     * =========================================================
     */

    async handle(
        bot,
        msg
    ) {

        if (
            !msg ||
            !msg.from ||
            !msg.chat
        ) {

            return false;
        }


        if (
            !msg.text
        ) {

            return false;
        }


        const userId =
            msg.from.id;


        try {

            const answer =
                await this.ask(
                    userId,
                    msg.text
                );


            await bot.sendMessage(
                msg.chat.id,
                answer
            );


            return true;

        } catch (error) {

            console.error(
                "❌ Nika runtime error:",
                error
            );


            /*
             * Do not expose internal stack traces
             * or implementation details to the user.
             */
            await bot.sendMessage(
                msg.chat.id,
                "Произошла ошибка при обработке сообщения. Попробуй ещё раз."
            );


            return false;
        }
    }


    /*
     * =========================================================
     * DIAGNOSTICS
     * =========================================================
     */

    getDiagnostics(
        userId
    ) {

        return {

            name:
                this.name,

            runtime:
                this.normalizeRuntimeState(
                    this.getRuntimeState(
                        userId
                    )
                ),

            conversation:
                this.conversation.getStats(
                    userId
                )
        };
    }
}


module.exports = new Nika();
