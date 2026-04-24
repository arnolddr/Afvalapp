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
`);

export default db;
