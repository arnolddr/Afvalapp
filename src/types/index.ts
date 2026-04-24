export interface WeightEntry {
  id: number;
  weight: number;
  unit: string;
  date: string;
}

export interface MealData {
  id: number;
  day: string;
  dayIndex: number;
  type: "lunch" | "dinner";
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
  allCalories?: Record<string, number>;
}

export interface MealPlan {
  id: number;
  weekStart: string;
  weekEnd: string;
  weight: number;
  targetCalories: number;
  generatedAt: string;
  meals: MealData[];
  allTargets?: Record<string, number>;
}

export interface GenerateMealPlanRequest {
  weight: number;
}
