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

    console.log("✅ Base schema initialized successfully!");

    const migrationsDir = path.join(
      __dirname,
      "migrations"
    );

    if (!fs.existsSync(migrationsDir)) {
      console.log("ℹ️ No migrations directory found.");
      return;
    }

    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of migrationFiles) {
      console.log(`⏳ Applying migration: ${file}`);

      const migration = fs.readFileSync(
        path.join(migrationsDir, file),
        "utf8"
      );

      await db.query(migration);

      console.log(`✅ Migration applied: ${file}`);
    }

    console.log("✅ Database initialization completed successfully!");
  } catch (err) {
    console.error("❌ Database initialization failed:");
    console.error(err);
  } finally {
    process.exit();
  }
}

setup();
