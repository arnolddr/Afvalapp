import { NextResponse } from "next/server";
import db from "@/lib/db";

const CATEGORIES: { label: string; keywords: RegExp[] }[] = [
  {
    label: "🥩 Vlees & vis",
    keywords: [/kip/i, /zalm/i, /gehakt/i, /tilapia/i, /tonijn/i, /kabeljauw/i, /vis/i, /köfte/i],
  },
  {
    label: "🥦 Groenten",
    keywords: [/komkommer/i, /tomaat/i, /courgette/i, /paprika/i, /broccoli/i, /spinazie/i, /ui/i, /knoflook/i, /wortel/i, /selderij/i, /prei/i, /asperge/i, /bloemkool/i, /champignon/i, /erwtjes/i, /boontjes/i, /avocado/i, /sla/i, /rucola/i, /bessen/i],
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
    keywords: [/rijst/i, /spaghetti/i, /pasta/i, /quinoa/i, /couscous/i, /granola/i, /vermicelli/i, /paneermeel/i],
  },
  {
    label: "🍞 Brood & wraps",
    keywords: [/brood/i, /wrap/i, /bodem/i, /roggebrood/i],
  },
  {
    label: "🧂 Kruiden & sauzen",
    keywords: [/olijfolie/i, /sojasaus/i, /sesamolie/i, /citroen/i, /mosterd/i, /honing/i, /tikka/i, /oregano/i, /basilicum/i, /komijn/i, /kurkuma/i, /koriander/i, /rozemarijn/i, /tijm/i, /laurier/i, /dille/i, /bieslook/i, /peterselie/i, /munt/i, /ras el/i, /sesamzaad/i, /worcester/i, /peper/i, /zout/i, /chili/i, /paprikapoeder/i, /gember/i],
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
    return NextResponse.json({ plan: null, categories: [] });
  }

  const meals = db
    .prepare("SELECT ingredients FROM Meal WHERE mealPlanId = ?")
    .all(plan.id as number) as { ingredients: string }[];

  const allIngredients: string[] = [];
  for (const meal of meals) {
    const parsed: string[] = JSON.parse(meal.ingredients);
    allIngredients.push(...parsed);
  }

  // Group by category
  const grouped: Record<string, string[]> = {};
  for (const ing of allIngredients) {
    const cat = categorize(ing);
    if (!grouped[cat]) grouped[cat] = [];
    // Avoid exact duplicates
    if (!grouped[cat].includes(ing)) grouped[cat].push(ing);
  }

  const categories = Object.entries(grouped).map(([label, items]) => ({
    label,
    items,
  }));

  // Sort categories in defined order
  const order = CATEGORIES.map((c) => c.label).concat(["🛒 Overig"]);
  categories.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));

  return NextResponse.json({
    plan: {
      weekStart: plan.weekStart,
      weekEnd: plan.weekEnd,
    },
    categories,
  });
}
