import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(process.cwd(), "dev.db"));
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS WeightEntry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    weight REAL NOT NULL,
    unit TEXT NOT NULL DEFAULT 'kg',
    date TEXT NOT NULL DEFAULT (datetime('now')),
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS MealPlan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    weekStart TEXT NOT NULL,
    weekEnd TEXT NOT NULL,
    weight REAL NOT NULL,
    targetCalories INTEGER NOT NULL,
    generatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS Meal (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mealPlanId INTEGER NOT NULL,
    day TEXT NOT NULL,
    dayIndex INTEGER NOT NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    calories INTEGER NOT NULL,
    protein INTEGER NOT NULL,
    carbs INTEGER NOT NULL,
    fat INTEGER NOT NULL,
    ingredients TEXT NOT NULL,
    instructions TEXT NOT NULL,
    FOREIGN KEY (mealPlanId) REFERENCES MealPlan(id) ON DELETE CASCADE
  );
`);

// Seed weight entries
const insertWeight = db.prepare(
  "INSERT INTO WeightEntry (weight, date) VALUES (?, ?)"
);
const weights = [
  [92.4, "2026-04-07"],
  [91.8, "2026-04-10"],
  [91.1, "2026-04-14"],
  [90.6, "2026-04-17"],
  [90.0, "2026-04-21"],
  [89.5, "2026-04-23"],
];
for (const [w, d] of weights) insertWeight.run(w, d);

console.log("Seed data aangemaakt!");
db.close();
