-- CreateTable
CREATE TABLE "WeightEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weight" REAL NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MealPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weekStart" DATETIME NOT NULL,
    "weekEnd" DATETIME NOT NULL,
    "weight" REAL NOT NULL,
    "targetCalories" INTEGER NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mealPlanId" INTEGER NOT NULL,
    "day" TEXT NOT NULL,
    "dayIndex" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "protein" INTEGER NOT NULL,
    "carbs" INTEGER NOT NULL,
    "fat" INTEGER NOT NULL,
    "ingredients" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    CONSTRAINT "Meal_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
