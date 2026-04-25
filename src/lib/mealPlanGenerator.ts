import {
  calculateWeightLossCalories,
  calculateLunchDinnerSplit,
  getNextSaturday,
  getWeekDays,
} from "./calories";

const DAYS_NL = [
  "Zaterdag",
  "Zondag",
  "Maandag",
  "Dinsdag",
  "Woensdag",
  "Donderdag",
  "Vrijdag",
];

interface Recipe {
  name: string;
  description: string;
  baseCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
}

export type { Recipe };
export const LUNCH_RECIPES: Recipe[] = [
  {
    name: "Griekse salade met gegrilde kip",
    description: "Frisse salade met komkommer, tomaat, feta en gegrilde kipfilet.",
    baseCalories: 420, protein: 38, carbs: 18, fat: 20,
    ingredients: ["200g kipfilet", "100g fetakaas", "300g komkommer", "250g cherrytomaatjes", "100g rode ui", "40g olijven", "2 el olijfolie", "sap van halve citroen", "oregano, zout, peper"],
    instructions: ["Kruid de kip met zout, peper en oregano en grill 6 min per kant.", "Snijd komkommer, tomaten en rode ui en meng in een schaal.", "Voeg olijven en verkruimelde feta toe.", "Besprenkel met olijfolie en citroensap.", "Leg de gesneden kip bovenop en serveer."],
  },
  {
    name: "Linzensoep met volkorenbrood",
    description: "Hartige linzensoep met wortel, selderij en een snufje komijn.",
    baseCalories: 390, protein: 20, carbs: 55, fat: 8,
    ingredients: ["200g rode linzen", "200g wortelen", "100g selderij", "150g ui", "2 teentjes knoflook", "400g gepelde tomaten", "1 tl komijn", "1 tl kurkuma", "1 liter groentebouillon", "80g volkorenbrood"],
    instructions: ["Fruit ui en knoflook 3 min in olijfolie.", "Voeg wortel, selderij en kruiden toe, bak 2 min mee.", "Voeg linzen, tomaten en bouillon toe.", "Laat 25 min zachtjes koken tot linzen gaar zijn.", "Pureer de helft voor romigheid en serveer met brood."],
  },
  {
    name: "Tonijn wrap met avocado",
    description: "Volkoren wrap gevuld met tonijn, avocado, spinazie en yoghurtdressing.",
    baseCalories: 410, protein: 30, carbs: 35, fat: 18,
    ingredients: ["160g tonijn op water", "150g avocado", "130g volkoren wraps", "50g spinazie", "4 el Griekse yoghurt", "sap van halve citroen", "zout, peper, bieslook"],
    instructions: ["Meng tonijn met yoghurt, citroensap en bieslook.", "Prak avocado met een vork en breng op smaak.", "Leg spinazie op de wrap, smeer avocado erop.", "Verdeel tonijnmengsel erover en rol op.", "Snijd diagonaal door en serveer."],
  },
  {
    name: "Kwark met bessen en granola",
    description: "Eiwitrijke kwark met verse bessen, een lepel honing en krokante granola.",
    baseCalories: 360, protein: 25, carbs: 48, fat: 8,
    ingredients: ["300g magere kwark", "100g gemengde bessen", "40g low-sugar granola", "1 tl honing", "munt ter garnering"],
    instructions: ["Schep kwark in een kom.", "Verdeel bessen erover.", "Strooi granola erover en druppel honing erop.", "Garneer met munt en serveer direct."],
  },
  {
    name: "Caesar salade met ei",
    description: "Knapperige romaine sla met hardgekookt ei, parmezaan en lichte caesardressing.",
    baseCalories: 380, protein: 22, carbs: 15, fat: 26,
    ingredients: ["250g romanosla", "180g eieren (3 stuks)", "30g parmezaan", "30g volkorencroutons", "2 el olijfolie", "1 el citroensap", "1 tl dijonmosterd", "1 teentje knoflook", "worcestersaus, zout, peper"],
    instructions: ["Kook eieren 8 min, schrik af en pel ze.", "Meng olijfolie, citroensap, mosterd, knoflook en worcestersaus tot dressing.", "Scheur sla in stukken en meng met dressing.", "Verdeel gesneden eieren erover.", "Rasp parmezaan erover en voeg croutons toe."],
  },
  {
    name: "Tomatensoep met hummus en brood",
    description: "Zelfgemaakte romige tomatensoep met verse basilicum en hartige hummus.",
    baseCalories: 370, protein: 14, carbs: 50, fat: 12,
    ingredients: ["500g rijpe tomaten", "400g gepelde tomaten", "150g ui", "2 teentjes knoflook", "2 el tomatenpuree", "500ml groentebouillon", "verse basilicum", "80g volkorenbrood", "100g hummus"],
    instructions: ["Fruit ui en knoflook zacht.", "Voeg tomaten, puree en bouillon toe.", "Kook 20 min en pureer glad.", "Breng op smaak met zout, peper en basilicum.", "Serveer met brood en hummus."],
  },
  {
    name: "Eiersalade op roggebrood",
    description: "Romige eiersalade met kruidenyoghurt op knapperig roggebrood.",
    baseCalories: 350, protein: 22, carbs: 30, fat: 14,
    ingredients: ["240g eieren (4 stuks)", "3 el Griekse yoghurt", "1 tl dijonmosterd", "bieslook, peterselie", "zout, peper", "160g roggebrood", "50g sla", "100g komkommer"],
    instructions: ["Kook eieren 8 min en hak grof.", "Meng met yoghurt, mosterd en kruiden.", "Breng op smaak.", "Beleg roggebrood met sla en komkommer.", "Verdeel eiersalade erover en serveer direct."],
  },
  {
    name: "Groentebouillon met volkoren pasta",
    description: "Lichte groentebouillon met kleine pasta en veel groenten.",
    baseCalories: 340, protein: 12, carbs: 52, fat: 6,
    ingredients: ["1500ml groentebouillon", "100g kleine volkoren pasta", "200g wortelen", "250g courgette", "100g erwtjes", "100g selderij", "150g ui", "peterselie, zout, peper"],
    instructions: ["Snijd alle groenten in kleine stukjes.", "Breng bouillon aan de kook.", "Voeg ui, wortel en selderij toe, kook 10 min.", "Voeg pasta toe en kook 8 min.", "Voeg courgette en erwtjes toe, kook 3 min.", "Garneer met peterselie en serveer."],
  },
  {
    name: "Kippensoep met groenten",
    description: "Klassieke kippensoep met wortel, prei en vermicelli.",
    baseCalories: 360, protein: 28, carbs: 35, fat: 10,
    ingredients: ["200g gekookte kipfilet", "1500ml kippenbouillon", "200g wortelen", "200g prei", "100g vermicelli", "150g ui", "tijm, laurier, peterselie", "zout, peper"],
    instructions: ["Breng bouillon met ui, tijm en laurier aan de kook.", "Voeg gesneden wortel en prei toe, kook 15 min.", "Voeg vermicelli toe en kook 5 min.", "Voeg gesnipperde kip toe en verwarm door.", "Bestrooi met peterselie en serveer."],
  },
  {
    name: "Zalmwrap met komkommer en dille",
    description: "Lichte wrap met gerookte zalm, roomkaas en verse dille.",
    baseCalories: 400, protein: 26, carbs: 32, fat: 18,
    ingredients: ["100g gerookte zalm", "130g volkoren wraps", "100g light roomkaas", "150g komkommer", "verse dille", "sap van halve citroen", "40g rucola", "zout, peper"],
    instructions: ["Smeer roomkaas op de wraps.", "Beleg met rucola en dun gesneden komkommer.", "Verdeel zalm erover en bestrooi met dille.", "Besprenkel met citroensap.", "Rol op, snijd doormidden en serveer direct."],
  },
];

export const DINNER_RECIPES: Recipe[] = [
  {
    name: "Zalm met geroosterde groenten en zoete aardappel",
    description: "Sappige zalmfilet met kleurrijke geroosterde groenten en zoete aardappelpuree.",
    baseCalories: 580, protein: 42, carbs: 45, fat: 22,
    ingredients: ["200g zalmfilet", "300g zoete aardappel", "250g courgette", "200g rode paprika", "400g broccoli", "2 el olijfolie", "knoflook, rozemarijn, zout, peper"],
    instructions: ["Verwarm oven op 200°C.", "Snijd groenten en schik op bakplaat, besprenkel met olijfolie en kruid.", "Rooster 20 min.", "Kook zoete aardappel gaar en stamp tot puree.", "Kruid zalm en bak 4 min per kant in koekenpan.", "Serveer zalm op de groenten met de puree ernaast."],
  },
  {
    name: "Kip tikka masala met bloemkoolrijst",
    description: "Romige tomatensaus met gekruide kip en lichte bloemkoolrijst.",
    baseCalories: 520, protein: 45, carbs: 22, fat: 28,
    ingredients: ["300g kipfilet in blokjes", "400ml kokosmelk (light)", "400g gepelde tomaten", "600g bloemkool", "2 el tikka masala pasta", "150g ui", "2 teentjes knoflook", "verse koriander"],
    instructions: ["Rasp bloemkool tot rijstkorrels en bak droog in pan, zet apart.", "Bak ui en knoflook glazig, voeg tikka pasta toe.", "Voeg kip toe en bak rondom bruin.", "Voeg tomaten en kokosmelk toe, sudder 15 min.", "Serveer met bloemkoolrijst en verse koriander."],
  },
  {
    name: "Gehaktballen in tomatensaus met spaghetti",
    description: "Zelfgemaakte gehaktballen in een rijke tomatensaus op volkoren spaghetti.",
    baseCalories: 560, protein: 38, carbs: 58, fat: 18,
    ingredients: ["300g mager rundergehakt", "180g volkoren spaghetti", "800g gepelde tomaten", "150g ui", "3 teentjes knoflook", "60g ei (1 stuk)", "2 el paneermeel", "basilicum, oregano, zout, peper"],
    instructions: ["Meng gehakt met ei, paneermeel, zout en peper en rol tot ballen.", "Bak gehaktballen rondom bruin en zet apart.", "Fruit ui en knoflook, voeg tomaten en kruiden toe.", "Laat saus 20 min sudderen, voeg gehaktballen toe.", "Kook spaghetti al dente en serveer met saus."],
  },
  {
    name: "Gevulde paprika's met quinoa en groenten",
    description: "Kleurrijke paprika's gevuld met quinoa, zwarte bonen, mais en kruiden.",
    baseCalories: 490, protein: 22, carbs: 62, fat: 14,
    ingredients: ["800g paprika's (4 stuks)", "200g quinoa", "400g zwarte bonen", "150g mais", "150g ui", "2 teentjes knoflook", "komijn, chilipoeder", "100g geraspte kaas (light)", "verse peterselie"],
    instructions: ["Verwarm oven op 190°C.", "Kook quinoa gaar.", "Fruit ui en knoflook, voeg bonen, mais en kruiden toe.", "Meng met quinoa.", "Halveer paprika's en verwijder zaadjes.", "Vul met quinoamengsel en bestrooi met kaas.", "Bak 25 min in oven tot paprika zacht is."],
  },
  {
    name: "Wokschotel kip met groenten en zilvervliesrijst",
    description: "Snelle roerbakschotel met kip, broccoli, wortel en een umami-saus.",
    baseCalories: 530, protein: 40, carbs: 55, fat: 14,
    ingredients: ["250g kipfilet in reepjes", "180g zilvervliesrijst", "400g broccoli", "200g wortelen", "200g paprika", "3 el sojasaus (laag zout)", "1 el sesamolie", "2 teentjes knoflook", "verse gember", "10g sesamzaad"],
    instructions: ["Kook rijst volgens verpakking.", "Verhit wok op hoog vuur met sesamolie.", "Bak kip al roerend gaar, zet apart.", "Wok groenten 4 min, voeg knoflook en gember toe.", "Voeg kip en sojasaus terug, roerbak 2 min.", "Serveer op rijst en bestrooi met sesamzaad."],
  },
  {
    name: "Gegrilde tilapia met asperges en aardappelen",
    description: "Lichte gegrilde tilapia met groene asperges en kleine aardappeltjes.",
    baseCalories: 510, protein: 44, carbs: 40, fat: 16,
    ingredients: ["200g tilapiafilet", "300g groene asperges", "300g kleine aardappelen", "2 el olijfolie", "sap van halve citroen", "dille, zout, peper"],
    instructions: ["Kook aardappelen 15 min, halveer ze daarna.", "Breek harde onderkant van asperges af.", "Kruid tilapia met dille, zout, peper en citroensap.", "Grill vis 3-4 min per kant op grillpan.", "Rooster aardappelen en asperges in olijfolie 10 min in oven op 200°C.", "Serveer vis met groenten en een partje citroen."],
  },
  {
    name: "Zelfgemaakte groentepizza op volkoren bodem",
    description: "Dunne volkoren pizza belegd met groenten, mozzarella en verse basilicum.",
    baseCalories: 540, protein: 28, carbs: 62, fat: 18,
    ingredients: ["350g volkoren pizzadeeg", "200ml passata", "125g mozzarella (light)", "250g courgette", "200g paprika", "100g champignons", "100g rode ui", "verse basilicum", "oregano, zout, peper"],
    instructions: ["Verwarm oven op 220°C.", "Rol deeg uit en smeer passata erop.", "Snijd groenten dun en verdeel erover.", "Scheur mozzarella in stukken en verdeel.", "Bestrooi met oregano en bak 12-15 min.", "Garneer met verse basilicum voor serveren."],
  },
  {
    name: "Stoofpotje kikkererwten met spinazie",
    description: "Vegetarisch stoofpotje met kikkererwten, spinazie en Marokkaanse kruiden.",
    baseCalories: 470, protein: 20, carbs: 58, fat: 14,
    ingredients: ["800g kikkererwten (uitgelekt)", "300g verse spinazie", "400g gepelde tomaten", "150g ui", "3 teentjes knoflook", "ras el hanout, komijn, paprikapoeder", "200g volkoren couscous", "verse koriander"],
    instructions: ["Fruit ui en knoflook in olijfolie.", "Voeg kruiden toe en bak 1 min.", "Voeg tomaten en kikkererwten toe, sudder 15 min.", "Voeg spinazie toe en laat slinken.", "Bereid couscous volgens verpakking.", "Serveer stoofpotje op couscous met koriander."],
  },
  {
    name: "Kabeljauw in papillot met groenten",
    description: "Gezonde kabeljauw gegaard in aluminiumfolie met seizoensgroenten.",
    baseCalories: 480, protein: 46, carbs: 38, fat: 14,
    ingredients: ["200g kabeljauwfilet", "200g boontjes", "200g wortelen", "250g courgette", "80g kerstomaatjes", "2 el olijfolie", "sap van halve citroen", "tijm, rozemarijn, zout, peper", "300g nieuwe aardappelen"],
    instructions: ["Verwarm oven op 190°C.", "Kook aardappelen 15 min.", "Snijd groenten en leg op vel aluminiumfolie.", "Leg vis bovenop, besprenkel met olijfolie en kruid.", "Vouw folie dicht en bak 18-20 min.", "Serveer direct uit het pakketje."],
  },
  {
    name: "Turkse kofte met tzatziki en rijst",
    description: "Gekruide gehaktrolletjes met verfrissende tzatziki en zilvervliesrijst.",
    baseCalories: 550, protein: 38, carbs: 50, fat: 20,
    ingredients: ["300g mager rundergehakt", "180g zilvervliesrijst", "150g ui (geraspt)", "2 teentjes knoflook", "komijn, koriander, paprikapoeder", "200g Griekse yoghurt", "150g komkommer", "verse munt en dille", "zout, peper"],
    instructions: ["Meng gehakt met ui, knoflook en kruiden.", "Vorm kleine rolletjes en grill 10-12 min op grillpan.", "Rasp komkommer, knijp vocht eruit.", "Meng met yoghurt, munt, dille en knoflook tot tzatziki.", "Kook rijst gaar.", "Serveer kofte op rijst met tzatziki."],
  },
];

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface ScaledRecipe extends Recipe {
  calories: number;
}

function scaleCalories(recipe: Recipe, target: number): ScaledRecipe {
  const factor = target / recipe.baseCalories;
  return {
    ...recipe,
    calories: target,
    protein: Math.round(recipe.protein * factor),
    carbs: Math.round(recipe.carbs * factor),
    fat: Math.round(recipe.fat * factor),
  };
}

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
  baseCalories: number;
}

function containsDisliked(recipe: Recipe, disliked: string[]): boolean {
  if (disliked.length === 0) return false;
  return recipe.ingredients.some((ing) =>
    disliked.some((d) => ing.toLowerCase().includes(d))
  );
}

export async function generateMealPlan(
  weightKg: number,
  heightCm = 170,
  age = 35,
  gender: "man" | "vrouw" = "man",
  dislikedIngredients: string[] = []
): Promise<{
  weekStart: Date;
  weekEnd: Date;
  targetCalories: number;
  meals: GeneratedMeal[];
}> {
  const targetCalories = calculateWeightLossCalories(weightKg, heightCm, age, gender);
  const { lunch: lunchTarget, dinner: dinnerTarget } = calculateLunchDinnerSplit(targetCalories);
  const saturday = getNextSaturday();
  const weekDays = getWeekDays(saturday);
  const weekEnd = weekDays[weekDays.length - 1];

  // Use week number as seed so same week always gives same menu
  const seed = Math.floor(saturday.getTime() / (7 * 24 * 60 * 60 * 1000));
  const lunchPool = LUNCH_RECIPES.filter((r) => !containsDisliked(r, dislikedIngredients));
  const dinnerPool = DINNER_RECIPES.filter((r) => !containsDisliked(r, dislikedIngredients));
  // Fall back to full list if too many exclusions to fill a week
  const lunches = shuffle(lunchPool.length >= 7 ? lunchPool : LUNCH_RECIPES, seed).slice(0, 7);
  const dinners = shuffle(dinnerPool.length >= 7 ? dinnerPool : DINNER_RECIPES, seed + 1).slice(0, 7);

  const meals: GeneratedMeal[] = [];
  for (let i = 0; i < 7; i++) {
    const lunch = scaleCalories(lunches[i], lunchTarget);
    const dinner = scaleCalories(dinners[i], dinnerTarget);

    meals.push({
      day: DAYS_NL[i], dayIndex: i, type: "lunch",
      name: lunch.name, description: lunch.description,
      calories: lunch.calories, protein: lunch.protein,
      carbs: lunch.carbs, fat: lunch.fat,
      ingredients: lunch.ingredients, instructions: lunch.instructions,
      baseCalories: lunches[i].baseCalories,
    });
    meals.push({
      day: DAYS_NL[i], dayIndex: i, type: "dinner",
      name: dinner.name, description: dinner.description,
      calories: dinner.calories, protein: dinner.protein,
      carbs: dinner.carbs, fat: dinner.fat,
      ingredients: dinner.ingredients, instructions: dinner.instructions,
      baseCalories: dinners[i].baseCalories,
    });
  }

  return { weekStart: saturday, weekEnd, targetCalories, meals };
}
