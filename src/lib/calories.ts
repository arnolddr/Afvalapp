export function calculateTDEE(
  weightKg: number,
  heightCm = 170,
  age = 35,
  gender: "man" | "vrouw" = "man"
): number {
  // Mifflin-St Jeor BMR, lightly active multiplier
  const genderOffset = gender === "man" ? 5 : -161;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + genderOffset;
  return Math.round(bmr * 1.375);
}

export function calculateWeightLossCalories(
  weightKg: number,
  heightCm = 170,
  age = 35,
  gender: "man" | "vrouw" = "man"
): number {
  // 500 kcal deficit ≈ 0.5 kg/week loss, minimum 1200
  return Math.max(calculateTDEE(weightKg, heightCm, age, gender) - 500, 1200);
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
  // On Saturday itself return today (week starts today); otherwise next Saturday
  const daysUntilSaturday = (6 - day + 7) % 7;
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
