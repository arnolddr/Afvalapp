import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH =
  process.env.DATABASE_PATH ||
  path.join(process.cwd(), "data", "afvalapp.db");

const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

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
`);

// Ensure at least two default profiles exist
const existingProfiles = db.prepare("SELECT COUNT(*) as count FROM Profile").get() as { count: number };
if (existingProfiles.count === 0) {
  db.prepare("INSERT INTO Profile (name) VALUES (?)").run("Ik");
  db.prepare("INSERT INTO Profile (name) VALUES (?)").run("Vriendin");
}

// Safe migrations: add columns if missing (existing installs)
try {
  db.exec("ALTER TABLE WeightEntry ADD COLUMN profile TEXT NOT NULL DEFAULT 'Ik'");
} catch {
  // column already exists
}
try {
  db.exec("ALTER TABLE Profile ADD COLUMN eatsSnacks INTEGER NOT NULL DEFAULT 0");
} catch {
  // column already exists
}
try {
  db.exec("ALTER TABLE MealPlan ADD COLUMN profile TEXT NOT NULL DEFAULT 'Ik'");
} catch {
  // column already exists
}
try {
  db.exec("ALTER TABLE Profile ADD COLUMN height INTEGER NOT NULL DEFAULT 170");
} catch {
  // column already exists
}
try {
  db.exec("ALTER TABLE Profile ADD COLUMN age INTEGER NOT NULL DEFAULT 35");
} catch {
  // column already exists
}
try {
  db.exec("ALTER TABLE Profile ADD COLUMN gender TEXT NOT NULL DEFAULT 'man'");
} catch {
  // column already exists
}
try {
  db.exec("ALTER TABLE Profile ADD COLUMN goalWeight REAL");
} catch {
  // column already exists
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

export default db;
