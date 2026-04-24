import { NextResponse } from "next/server";
import db from "@/lib/db";
import { scaleIngredient } from "@/lib/ingredients";
import { weekSnacks } from "@/lib/snacks";

const CATEGORIES: { label: string; keywords: RegExp[] }[] = [
  {
    label: "🥩 Vlees & vis",
    keywords: [/kip/i, /zalm/i, /gehakt/i, /tilapia/i, /tonijn/i, /kabeljauw/i, /vis/i, /köfte/i],
  },
  {
    label: "🥦 Groenten & fruit",
    keywords: [/komkommer/i, /tomaat/i, /courgette/i, /paprika/i, /broccoli/i, /spinazie/i, /ui/i, /knoflook/i, /wortel/i, /selderij/i, /prei/i, /asperge/i, /bloemkool/i, /champignon/i, /erwtjes/i, /boontjes/i, /avocado/i, /sla/i, /rucola/i, /bessen/i, /appel/i, /banaan/i, /druiven/i, /edamame/i],
  },
  {
    label: "🧀 Zuivel & eieren",
    keywords: [/feta/i, /mozzarella/i, /kwark/i, /yoghurt/i, /kaas/i, /\bei\b/i, /eieren/i, /roomkaas/i, /kokosmelk/i],
  },
  {
    label: "🥫 Conserven & blikken",
    keywords: [/linzen/i, /bonen/i, /kikkererwten/i, /blik/i, /maïs/i, /passata/i, /tomatenpuree/i, /bouillon/i],
  },
  {
    label: "🍚 Granen & pasta",
    keywords: [/rijst/i, /spaghetti/i, /pasta/i, /quinoa/i, /couscous/i, /granola/i, /vermicelli/i, /paneermeel/i, /rijstwafel/i],
  },
  {
    label: "🍞 Brood & wraps",
    keywords: [/brood/i, /wrap/i, /bodem/i, /roggebrood/i],
  },
  {
    label: "🧂 Kruiden, noten & sauzen",
    keywords: [/olijfolie/i, /sojasaus/i, /sesamolie/i, /citroen/i, /mosterd/i, /honing/i, /tikka/i, /oregano/i, /basilicum/i, /komijn/i, /kurkuma/i, /koriander/i, /rozemarijn/i, /tijm/i, /laurier/i, /dille/i, /bieslook/i, /peterselie/i, /munt/i, /ras el/i, /sesamzaad/i, /worcester/i, /peper/i, /zout/i, /chili/i, /paprikapoeder/i, /gember/i, /amandelen/i, /noten/i, /pindakaas/i, /hummus/i],
  },
];

function categorize(ingredient: string): string {
  for (const cat of CATEGORIES) {
    if (cat.keywords.some((re) => re.test(ingredient))) return cat.label;
  }
  return "🛒 Overig";
}

export async function GET() {
  const plan = db
    .prepare("SELECT * FROM MealPlan ORDER BY generatedAt DESC LIMIT 1")
    .get() as Record<string, unknown> | undefined;

  if (!plan) {
    return NextResponse.json({ plan: null, categories: [], servings: 2 });
  }

  const meals = db
    .prepare("SELECT ingredients FROM Meal WHERE mealPlanId = ?")
    .all(plan.id as number) as { ingredients: string }[];

  const servings = 2; // couple portions

  // Main menu ingredients (doubled for 2 people)
  const allIngredients: string[] = [];
  for (const meal of meals) {
    const parsed: string[] = JSON.parse(meal.ingredients);
    for (const ing of parsed) {
      allIngredients.push(scaleIngredient(ing, servings));
    }
  }

  // Add snack ingredients for each profile that eats snacks
  const snackProfiles = db
    .prepare("SELECT name FROM Profile WHERE eatsSnacks = 1")
    .all() as { name: string }[];

  const seed = Math.floor(
    new Date(plan.weekStart as string).getTime() / (7 * 24 * 60 * 60 * 1000)
  );

  for (const p of snackProfiles) {
    const snacks = weekSnacks(p.name, seed);
    for (const s of snacks) {
      for (const ing of s.ingredients) {
        allIngredients.push(ing);
      }
    }
  }

  // Group by category
  const grouped: Record<string, string[]> = {};
  for (const ing of allIngredients) {
    const cat = categorize(ing);
    if (!grouped[cat]) grouped[cat] = [];
    if (!grouped[cat].includes(ing)) grouped[cat].push(ing);
  }

  const categories = Object.entries(grouped).map(([label, items]) => ({
    label,
    items,
  }));

  const order = CATEGORIES.map((c) => c.label).concat(["🛒 Overig"]);
  categories.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));

  return NextResponse.json({
    plan: {
      weekStart: plan.weekStart,
      weekEnd: plan.weekEnd,
    },
    servings,
    snackProfiles: snackProfiles.map((p) => p.name),
    categories,
  });
}
