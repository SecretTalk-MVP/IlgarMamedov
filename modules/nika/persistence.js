const db = require('../../database/db');

const DEFAULT_STATE = {
    relationshipState: 'NEW',
    consentState: 'UNKNOWN',
    interactionMode: 'NEUTRAL',
    adultVerified: false,
    lastInitiativeAction: null,
    lastActivityAt: null
};

async function getState(telegramId) {
    const result = await db.query(
        `
        SELECT
            telegram_id,
            relationship_state,
            consent_state,
            interaction_mode,
            adult_verified,
            last_initiative_action,
            last_activity_at,
            updated_at
        FROM nika_runtime_state
        WHERE telegram_id = $1
        LIMIT 1
        `,
        [telegramId]
    );

    if (result.rows.length === 0) {
        return {
            ...DEFAULT_STATE
        };
    }

    const row = result.rows[0];

    return {
        relationshipState: row.relationship_state,
        consentState: row.consent_state,
        interactionMode: row.interaction_mode,
        adultVerified: row.adult_verified,
        lastInitiativeAction: row.last_initiative_action,
        lastActivityAt: row.last_activity_at
    };
}

async function saveState(telegramId, state) {
    await db.query(
        `
        INSERT INTO nika_runtime_state (
            telegram_id,
            relationship_state,
            consent_state,
            interaction_mode,
            adult_verified,
            last_initiative_action,
            last_activity_at,
            updated_at
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            CURRENT_TIMESTAMP
        )
        ON CONFLICT (telegram_id)
        DO UPDATE SET
            relationship_state = EXCLUDED.relationship_state,
            consent_state = EXCLUDED.consent_state,
            interaction_mode = EXCLUDED.interaction_mode,
            adult_verified = EXCLUDED.adult_verified,
            last_initiative_action = EXCLUDED.last_initiative_action,
            last_activity_at = EXCLUDED.last_activity_at,
            updated_at = CURRENT_TIMESTAMP
        `,
        [
            telegramId,
            state.relationshipState,
            state.consentState,
            state.interactionMode,
            state.adultVerified,
            state.lastInitiativeAction || null,
            state.lastActivityAt || null
        ]
    );

    return state;
}

async function updateState(telegramId, patch) {
    const currentState = await getState(telegramId);

    const nextState = {
        ...currentState,
        ...patch
    };

    await saveState(
        telegramId,
        nextState
    );

    return nextState;
}

module.exports = {
    getState,
    saveState,
    updateState
};
