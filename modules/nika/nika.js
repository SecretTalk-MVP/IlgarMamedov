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
 *      ├── PostgreSQL Runtime Persistence
 *      └── Conversation / Memory
 *              ↓
 *           Nika AI
 *
 * Responsibilities:
 * - orchestrate Nika runtime;
 * - maintain runtime state;
 * - persist runtime state in PostgreSQL;
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
const NikaPersistence = require("./nika.persistence");


class Nika {

    constructor() {

        this.name = "Nika";


        /*
         * =========================================================
         * PERSONA LAYER
         * =========================================================
         *
         * Nika's character remains completely separated
         * from runtime logic.
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
         * =========================================================
         * RELATIONSHIP STATE
         * =========================================================
         */

        this.RELATIONSHIP_STATES = Object.freeze({

            NEW:
                "NEW",

            ACQUAINTED:
                "ACQUAINTED",

            FAMILIAR:
                "FAMILIAR",

            CLOSE:
                "CLOSE"
        });


        /*
         * =========================================================
         * CONSENT STATE
         * =========================================================
         */

        this.CONSENT_STATES = Object.freeze({

            UNKNOWN:
                "UNKNOWN",

            GRANTED:
                "GRANTED",

            DECLINED:
                "DECLINED",

            REVOKED:
                "REVOKED"
        });


        /*
         * =========================================================
         * INTERACTION MODE
         * =========================================================
         */

        this.INTERACTION_MODES = Object.freeze({

            NEUTRAL:
                "NEUTRAL",

            FRIENDLY:
                "FRIENDLY",

            PLAYFUL:
                "PLAYFUL",

            ROMANTIC:
                "ROMANTIC",

            ADULT_ORIENTED:
                "ADULT_ORIENTED"
        });


        /*
         * =========================================================
         * INITIATIVE ENGINE
         * =========================================================
         */

        this.INITIATIVE_ACTIONS = Object.freeze({

            ANSWER:
                "ANSWER",

            CONTINUE:
                "CONTINUE",

            REACT:
                "REACT",

            TEASE:
                "TEASE",

            FLIRT:
                "FLIRT",

            SUGGEST:
                "SUGGEST",

            ASK:
                "ASK",

            CHANGE_TOPIC:
                "CHANGE_TOPIC",

            DEESCALATE:
                "DEESCALATE",

            STOP:
                "STOP"
        });


        /*
         * =========================================================
         * CONVERSATION / MEMORY
         * =========================================================
         *
         * nika.conversation.js exports a CLASS.
         *
         * Exactly one conversation runtime instance is created.
         */

        this.conversation =
            new NikaConversation();


        /*
         * =========================================================
         * POSTGRESQL PERSISTENCE
         * =========================================================
         *
         * Runtime state is persisted separately from the
         * conversation/memory layer.
         *
         * This prevents Railway restarts from resetting
         * Nika's runtime state.
         */

        this.persistence =
            NikaPersistence;


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
     * STATE NORMALIZATION
     * =========================================================
     */

    normalizeRuntimeState(state) {

        const defaults =
            this.createDefaultRuntimeState();

        return {

            ...defaults,

            ...(state || {}),

            metadata: {

                ...defaults.metadata,

                ...(
                    state &&
                    state.metadata
                        ? state.metadata
                        : {}
                )
            }
        };
    }


    /*
     * =========================================================
     * POSTGRESQL STATE LOADING
     * =========================================================
     *
     * Load persistent state into the current conversation
     * runtime before processing a message.
     */

    async loadPersistentRuntimeState(userId) {

        const persistentState =
            await this.persistence.getState(
                userId
            );

        const normalized =
            this.normalizeRuntimeState(
                persistentState
            );

        this.conversation.setState(
            userId,
            normalized
        );

        return normalized;
    }


    /*
     * =========================================================
     * POSTGRESQL STATE SAVING
     * =========================================================
     */

    async savePersistentRuntimeState(userId) {

        const state =
            this.normalizeRuntimeState(
                this.getRuntimeState(
                    userId
                )
            );

        await this.persistence.saveState(
            userId,
            state
        );

        return state;
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


    /*
     * =========================================================
     * INTERACTION MODE
     * =========================================================
     */

    isModeAllowed(
        state,
        mode
    ) {

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
                this.getRuntimeState(
                    userId
                )
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
     * Verification and consent remain deliberately separate.
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
         * returns interaction to NEUTRAL.
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
                this.getRuntimeState(
                    userId
                )
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
         * Longer clear messages favor
         * conversational continuation.
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
     * It does not replace model/platform safety.
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
         * =====================================================
         * LOAD PERSISTENT STATE
         * =====================================================
         *
         * PostgreSQL is the persistent source for Runtime State.
         *
         * The in-memory conversation layer is synchronized
         * from PostgreSQL before processing the message.
         */

        await this.loadPersistentRuntimeState(
            userId
        );


        /*
         * =====================================================
         * BUILD CONTEXT
         * =====================================================
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
         * =====================================================
         * DETERMINE INITIATIVE
         * =====================================================
         */

        const initiativeAction =
            this.determineInitiative(

                userId,

                message,

                state
            );


        /*
         * =====================================================
         * SAFETY GATE
         * =====================================================
         */

        const safety =
            this.safetyGate(

                userId,

                message,

                state,

                initiativeAction
            );


        /*
         * =====================================================
         * APPLY SAFETY STATE PATCH
         * =====================================================
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
         * =====================================================
         * RECORD INITIATIVE ACTION
         * =====================================================
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
         * =====================================================
         * REBUILD CONTEXT
         * =====================================================
         */

        const effectiveContext =
            this.conversation.buildContext(
                userId
            );


        /*
         * =====================================================
         * BUILD FINAL SYSTEM PROMPT
         * =====================================================
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
         * =====================================================
         * CONVERSATION HISTORY
         * =====================================================
         *
         * Existing history +
         * current user message.
         *
         * Current message is NOT saved until
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
         * =====================================================
         * GENERATE NIKA RESPONSE
         * =====================================================
         */

        const answer =
            await nikaAI.generate(

                effectiveSystemPrompt,

                conversationMessages
            );


        /*
         * =====================================================
         * SAVE SUCCESSFUL EXCHANGE
         * =====================================================
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
         * =====================================================
         * UPDATE RELATIONSHIP
         * =====================================================
         */

        this.updateRelationshipAfterMessage(
            userId
        );


        /*
         * =====================================================
         * UPDATE ACTIVITY
         * =====================================================
         */

        this.conversation.touch(
            userId
        );


        /*
         * =====================================================
         * SAVE FINAL RUNTIME STATE
         * =====================================================
         *
         * This is the important persistence boundary.
         *
         * Everything that changed during the successful
         * interaction is written to PostgreSQL.
         */

        await this.savePersistentRuntimeState(
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
