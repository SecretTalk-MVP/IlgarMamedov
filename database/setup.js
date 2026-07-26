console.log("🔥 setup.js started");
const fs = require("fs");
const path = require("path");
const db = require("./db");

async function setup() {
  try {
    console.log("⏳ Initializing database...");

    const schema = fs.readFileSync(
      path.join(__dirname, "schema.sql"),
      "utf8"
    );

    await db.query(schema);

    console.log("✅ Database initialized successfully!");
  } catch (err) {
    console.error("❌ Database initialization failed:");
    console.error(err);
  } finally {
    process.exit();
  }
}

setup();
