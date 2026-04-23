import Anthropic from "@anthropic-ai/sdk";
import {
  calculateWeightLossCalories,
  calculateLunchDinnerSplit,
  getNextSaturday,
  getWeekDays,
} from "./calories";

const client = new Anthropic();

const DAYS_NL = [
  "Zaterdag",
  "Zondag",
  "Maandag",
  "Dinsdag",
  "Woensdag",
  "Donderdag",
  "Vrijdag",
];

interface GeneratedMeal {
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
}

interface MealPlanResponse {
  meals: GeneratedMeal[];
}

export async function generateMealPlan(weightKg: number): Promise<{
  weekStart: Date;
  weekEnd: Date;
  targetCalories: number;
  meals: GeneratedMeal[];
}> {
  const targetCalories = calculateWeightLossCalories(weightKg);
  const { lunch: lunchCalories, dinner: dinnerCalories } =
    calculateLunchDinnerSplit(targetCalories);
  const saturday = getNextSaturday();
  const weekDays = getWeekDays(saturday);
  const weekEnd = weekDays[weekDays.length - 1];

  const prompt = `Je bent een voedingsdeskundige die gespecialiseerd is in gezond afvallen.
Maak een weekmenu voor 7 dagen (zaterdag t/m vrijdag) voor iemand van ${weightKg} kg die wil afvallen.

Dagelijks caloriedoel: ${targetCalories} kcal
- Lunch: ~${lunchCalories} kcal
- Diner: ~${dinnerCalories} kcal

Richtlijnen:
- Veel groenten en vezels voor verzadiging
- Voldoende eiwitten (minimaal 1.2g per kg lichaamsgewicht = ${Math.round(weightKg * 1.2)}g/dag)
- Weinig toegevoegde suikers
- Gevarieerde, Nederlandse/Europese recepten die makkelijk te maken zijn
- Elk recept heeft duidelijke stap-voor-stap instructies

Geef de recepten terug als JSON in dit formaat:
{
  "meals": [
    {
      "day": "Zaterdag",
      "dayIndex": 0,
      "type": "lunch",
      "name": "Naam van het gerecht",
      "description": "Korte beschrijving (1-2 zinnen)",
      "calories": 450,
      "protein": 30,
      "carbs": 40,
      "fat": 12,
      "ingredients": ["200g kipfilet", "1 komkommer", "..."],
      "instructions": ["Stap 1: ...", "Stap 2: ...", "..."]
    }
  ]
}

Maak precies 14 maaltijden: voor elke dag 1 lunch en 1 diner.
De volgorde is: Zaterdag lunch, Zaterdag diner, Zondag lunch, Zondag diner, etc.
Gebruik dayIndex: 0=Zaterdag, 1=Zondag, 2=Maandag, 3=Dinsdag, 4=Woensdag, 5=Donderdag, 6=Vrijdag.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse meal plan from Claude response");
  }

  const parsed: MealPlanResponse = JSON.parse(jsonMatch[0]);

  // Attach actual dates to days
  const mealsWithDates = parsed.meals.map((meal) => ({
    ...meal,
    day: DAYS_NL[meal.dayIndex] || meal.day,
  }));

  return {
    weekStart: saturday,
    weekEnd,
    targetCalories,
    meals: mealsWithDates,
  };
}
