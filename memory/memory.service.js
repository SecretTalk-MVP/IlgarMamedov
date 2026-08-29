const db = require('../database/db');

class MemoryService {

  async loadMemory(userId) {
    console.log("Loading memory for:", userId);

    const result = await db.query(
      "SELECT memory FROM user_memory WHERE telegram_id = $1",
      [userId]
    );

    if (result.rows.length > 0) {
      return result.rows[0].memory;
    }

    return {
      profile: {
        name: null,
        gender: null,
        age: null,
        country: null,
        language: null
      },

      conversation: {
        summary: "",
        lastTopic: "",
        lastInteraction: null
      },

      relationship: {
        trustLevel: 0,
        notes: [],
        promises: []
      }
    };
  }

  async saveMemory(userId, memory) {
    console.log("Saving memory for:", userId);

    await db.query(
      `
      INSERT INTO user_memory (telegram_id, memory)
      VALUES ($1, $2)
      ON CONFLICT (telegram_id)
      DO UPDATE SET
        memory = EXCLUDED.memory,
        updated_at = CURRENT_TIMESTAMP
      `,
      [userId, memory]
    );
  }

}

module.exports = MemoryService;
