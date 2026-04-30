import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH =
  process.env.DATABASE_PATH ||
  path.join(process.cwd(), "data", "afvalapp.db");

// During `next build`, page-data collection imports every API route module in
// 3 parallel workers. If we write to a shared DB file at module load (pragmas,
// CREATE TABLE, migrations, cleanup DELETEs) they race and SQLite throws
// SQLITE_BUSY. The build only needs the module to be importable, not functional,
// so use a throwaway in-memory DB during the build phase.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

let db: Database.Database;

if (isBuildPhase) {
  db = new Database(":memory:");
} else {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  // Wait up to 10s for concurrent writers instead of throwing SQLITE_BUSY immediately
  db.pragma("busy_timeout = 10000");

  db.exec(`
    CREATE TABLE IF NOT EXISTS WeightEntry (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      weight    REAL    NOT NULL,
      unit      TEXT    NOT NULL DEFAULT 'kg',
      profile   TEXT    NOT NULL DEFAULT 'Ik',
      date      TEXT    NOT NULL DEFAULT (datetime('now')),
      createdAt TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS MealPlan (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      weekStart      TEXT    NOT NULL,
      weekEnd        TEXT    NOT NULL,
      weight         REAL    NOT NULL,
      targetCalories INTEGER NOT NULL,
      generatedAt    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS Meal (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      mealPlanId   INTEGER NOT NULL,
      day          TEXT    NOT NULL,
      dayIndex     INTEGER NOT NULL,
      type         TEXT    NOT NULL,
      name         TEXT    NOT NULL,
      description  TEXT    NOT NULL,
      calories     INTEGER NOT NULL,
      protein      INTEGER NOT NULL,
      carbs        INTEGER NOT NULL,
      fat          INTEGER NOT NULL,
      ingredients  TEXT    NOT NULL,
      instructions TEXT    NOT NULL,
      FOREIGN KEY (mealPlanId) REFERENCES MealPlan(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Profile (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL UNIQUE,
      eatsSnacks INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS DislikedIngredient (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      ingredient TEXT    NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS ShoppingChecked (
      id   INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT    NOT NULL DEFAULT '{}'
    );
    INSERT OR IGNORE INTO ShoppingChecked (id, data) VALUES (1, '{}');

    CREATE TABLE IF NOT EXISTS FavoriteRecipe (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT    NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS User (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      username     TEXT    NOT NULL UNIQUE,
      passwordHash TEXT    NOT NULL,
      totpSecret   TEXT,
      totpVerified INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS Session (
      token     TEXT    PRIMARY KEY,
      userId    INTEGER NOT NULL,
      createdAt TEXT    NOT NULL DEFAULT (datetime('now')),
      expiresAt TEXT    NOT NULL,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS PendingAuth (
      token     TEXT    PRIMARY KEY,
      userId    INTEGER NOT NULL,
      expiresAt TEXT    NOT NULL
    );
  `);

  const existingProfiles = db.prepare("SELECT COUNT(*) as count FROM Profile").get() as { count: number };
  if (existingProfiles.count === 0) {
    db.prepare("INSERT INTO Profile (name) VALUES (?)").run("Ik");
    db.prepare("INSERT INTO Profile (name) VALUES (?)").run("Vriendin");
  }

  // Safe migrations: add columns if missing (existing installs)
  const migrations = [
    "ALTER TABLE WeightEntry ADD COLUMN profile TEXT NOT NULL DEFAULT 'Ik'",
    "ALTER TABLE Profile ADD COLUMN eatsSnacks INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE MealPlan ADD COLUMN profile TEXT NOT NULL DEFAULT 'Ik'",
    "ALTER TABLE Profile ADD COLUMN height INTEGER NOT NULL DEFAULT 170",
    "ALTER TABLE Profile ADD COLUMN age INTEGER NOT NULL DEFAULT 35",
    "ALTER TABLE Profile ADD COLUMN gender TEXT NOT NULL DEFAULT 'man'",
    "ALTER TABLE Profile ADD COLUMN goalWeight REAL",
    "ALTER TABLE Meal ADD COLUMN baseCalories INTEGER NOT NULL DEFAULT 0",
  ];
  for (const sql of migrations) {
    try {
      db.exec(sql);
    } catch {
      // column already exists
    }
  }

  // One-time cleanup: keep only the most recent plan per week, then prune to 2 weeks total
  db.exec(`
    DELETE FROM MealPlan WHERE id NOT IN (
      SELECT MAX(id) FROM MealPlan GROUP BY weekStart
    )
  `);
  const remaining = db
    .prepare("SELECT id FROM MealPlan ORDER BY generatedAt DESC")
    .all() as { id: number }[];
  if (remaining.length > 2) {
    const toDelete = remaining.slice(2).map((p) => p.id);
    const placeholders = toDelete.map(() => "?").join(",");
    db.prepare(`DELETE FROM MealPlan WHERE id IN (${placeholders})`).run(...toDelete);
  }
}

export default db;
