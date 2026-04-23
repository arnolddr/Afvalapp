export function calculateTDEE(weightKg: number): number {
  // Mifflin-St Jeor for sedentary lifestyle (conservative estimate for weight loss)
  // Assumes average adult male (can be expanded with gender/height/age)
  const bmr = 10 * weightKg + 6.25 * 170 - 5 * 35 + 5;
  const tdee = bmr * 1.375; // lightly active
  return Math.round(tdee);
}

export function calculateWeightLossCalories(weightKg: number): number {
  const tdee = calculateTDEE(weightKg);
  // 500 kcal deficit = ~0.5kg/week loss
  const target = tdee - 500;
  return Math.max(target, 1200); // never go below 1200
}

export function calculateLunchDinnerSplit(totalCalories: number): {
  lunch: number;
  dinner: number;
} {
  return {
    lunch: Math.round(totalCalories * 0.4),
    dinner: Math.round(totalCalories * 0.6),
  };
}

export function getNextSaturday(): Date {
  const today = new Date();
  const day = today.getDay(); // 0=Sun, 6=Sat
  const daysUntilSaturday = day === 6 ? 7 : (6 - day + 7) % 7 || 7;
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + daysUntilSaturday);
  saturday.setHours(0, 0, 0, 0);
  return saturday;
}

export function getWeekDays(saturday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(saturday);
    d.setDate(saturday.getDate() + i);
    return d;
  });
}

export function isThursday(): boolean {
  return new Date().getDay() === 4;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
