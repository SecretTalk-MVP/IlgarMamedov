const db = require('../database/db');

async function saveUser(msg) {
  try {
    await db.query(
      `INSERT INTO users (telegram_id, username, first_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (telegram_id)
       DO UPDATE SET
         username = EXCLUDED.username,
         first_name = EXCLUDED.first_name,
         last_seen = CURRENT_TIMESTAMP`,
      [
        msg.from.id,
        msg.from.username || null,
        msg.from.first_name || null
      ]
    );
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  saveUser
};
