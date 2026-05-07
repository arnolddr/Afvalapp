type NutritionPer100g = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  pieceGrams?: number;
};

export const NUTRITION_DB: Record<string, NutritionPer100g> = {
  // Vlees & vis
  kipfilet:             { kcal: 110, protein: 23, carbs: 0,  fat: 2  },
  kip:                  { kcal: 110, protein: 23, carbs: 0,  fat: 2  },
  kippendijtjes:        { kcal: 145, protein: 19, carbs: 0,  fat: 8  },
  kalkoenfilet:         { kcal: 104, protein: 24, carbs: 0,  fat: 1  },
  kalkoen:              { kcal: 104, protein: 24, carbs: 0,  fat: 1  },
  zalmfilet:            { kcal: 182, protein: 20, carbs: 0,  fat: 11 },
  zalm:                 { kcal: 182, protein: 20, carbs: 0,  fat: 11 },
  "gerookte zalm":      { kcal: 142, protein: 18, carbs: 0,  fat: 8  },
  tonijn:               { kcal: 116, protein: 26, carbs: 0,  fat: 1  },
  tilapia:              { kcal: 96,  protein: 20, carbs: 0,  fat: 2  },
  tilapiafilet:         { kcal: 96,  protein: 20, carbs: 0,  fat: 2  },
  kabeljauw:            { kcal: 82,  protein: 18, carbs: 0,  fat: 1  },
  kabeljauwfilet:       { kcal: 82,  protein: 18, carbs: 0,  fat: 1  },
  makreel:              { kcal: 205, protein: 19, carbs: 0,  fat: 14 },
  forel:                { kcal: 141, protein: 20, carbs: 0,  fat: 6  },
  garnalen:             { kcal: 99,  protein: 21, carbs: 0,  fat: 1  },
  mosselen:             { kcal: 95,  protein: 12, carbs: 5,  fat: 2  },
  rundergehakt:         { kcal: 174, protein: 21, carbs: 0,  fat: 10 },
  gehakt:               { kcal: 174, protein: 21, carbs: 0,  fat: 10 },
  varkensvlees:         { kcal: 242, protein: 27, carbs: 0,  fat: 15 },
  lamsvlees:            { kcal: 218, protein: 22, carbs: 0,  fat: 14 },
  // Zuivel & eieren
  ei:                   { kcal: 155, protein: 13, carbs: 1,  fat: 11, pieceGrams: 60 },
  eieren:               { kcal: 155, protein: 13, carbs: 1,  fat: 11, pieceGrams: 60 },
  kwark:                { kcal: 57,  protein: 11, carbs: 3,  fat: 0  },
  "griekse yoghurt":    { kcal: 100, protein: 10, carbs: 4,  fat: 5  },
  yoghurt:              { kcal: 61,  protein: 4,  carbs: 7,  fat: 2  },
  fetakaas:             { kcal: 264, protein: 14, carbs: 4,  fat: 21 },
  feta:                 { kcal: 264, protein: 14, carbs: 4,  fat: 21 },
  kaas:                 { kcal: 402, protein: 25, carbs: 0,  fat: 33 },
  mozzarella:           { kcal: 280, protein: 28, carbs: 2,  fat: 17 },
  parmezaan:            { kcal: 431, protein: 38, carbs: 4,  fat: 29 },
  roomkaas:             { kcal: 350, protein: 6,  carbs: 4,  fat: 34 },
  "cottage cheese":     { kcal: 98,  protein: 11, carbs: 3,  fat: 4  },
  melk:                 { kcal: 46,  protein: 3,  carbs: 5,  fat: 2  },
  sojamelk:             { kcal: 33,  protein: 3,  carbs: 3,  fat: 2  },
  // Peulvruchten
  kikkererwten:         { kcal: 164, protein: 9,  carbs: 27, fat: 3  },
  "zwarte bonen":       { kcal: 132, protein: 9,  carbs: 24, fat: 1  },
  kidneybonen:          { kcal: 127, protein: 9,  carbs: 23, fat: 1  },
  "witte bonen":        { kcal: 150, protein: 10, carbs: 28, fat: 1  },
  "bruine bonen":       { kcal: 150, protein: 10, carbs: 28, fat: 1  },
  linzen:               { kcal: 116, protein: 9,  carbs: 20, fat: 1  },
  "rode linzen":        { kcal: 116, protein: 9,  carbs: 20, fat: 1  },
  "groene linzen":      { kcal: 116, protein: 9,  carbs: 20, fat: 1  },
  edamame:              { kcal: 121, protein: 11, carbs: 9,  fat: 5  },
  hummus:               { kcal: 170, protein: 8,  carbs: 14, fat: 10 },
  tofu:                 { kcal: 76,  protein: 8,  carbs: 2,  fat: 4  },
  tempeh:               { kcal: 193, protein: 19, carbs: 9,  fat: 11 },
  // Granen (drooggewicht tenzij anders)
  "zilvervliesrijst":   { kcal: 350, protein: 8,  carbs: 74, fat: 3  },
  rijst:                { kcal: 350, protein: 7,  carbs: 77, fat: 1  },
  quinoa:               { kcal: 368, protein: 14, carbs: 64, fat: 6  },
  "volkoren spaghetti": { kcal: 352, protein: 13, carbs: 65, fat: 3  },
  spaghetti:            { kcal: 371, protein: 13, carbs: 75, fat: 2  },
  pasta:                { kcal: 371, protein: 13, carbs: 75, fat: 2  },
  "volkoren pasta":     { kcal: 352, protein: 13, carbs: 65, fat: 3  },
  penne:                { kcal: 371, protein: 13, carbs: 75, fat: 2  },
  tagliatelle:          { kcal: 371, protein: 13, carbs: 75, fat: 2  },
  fusilli:              { kcal: 371, protein: 13, carbs: 75, fat: 2  },
  couscous:             { kcal: 376, protein: 13, carbs: 72, fat: 2  },
  bulgur:               { kcal: 342, protein: 12, carbs: 76, fat: 1  },
  volkorenbrood:        { kcal: 247, protein: 9,  carbs: 43, fat: 4  },
  roggebrood:           { kcal: 259, protein: 9,  carbs: 48, fat: 3  },
  wraps:                { kcal: 290, protein: 9,  carbs: 47, fat: 7  },
  wrap:                 { kcal: 290, protein: 9,  carbs: 47, fat: 7  },
  tortilla:             { kcal: 290, protein: 9,  carbs: 47, fat: 7  },
  paneermeel:           { kcal: 395, protein: 13, carbs: 74, fat: 4  },
  havermout:            { kcal: 389, protein: 13, carbs: 67, fat: 7  },
  granola:              { kcal: 450, protein: 10, carbs: 65, fat: 16 },
  vermicelli:           { kcal: 371, protein: 13, carbs: 75, fat: 2  },
  glasnoedels:          { kcal: 351, protein: 0,  carbs: 87, fat: 0  },
  rijstnoedels:         { kcal: 364, protein: 7,  carbs: 80, fat: 1  },
  croutons:             { kcal: 395, protein: 13, carbs: 72, fat: 10 },
  brood:                { kcal: 247, protein: 9,  carbs: 43, fat: 4  },
  pitabrood:            { kcal: 275, protein: 9,  carbs: 56, fat: 2  },
  maïsmeel:             { kcal: 365, protein: 7,  carbs: 79, fat: 4  },
  bloem:                { kcal: 364, protein: 10, carbs: 76, fat: 1  },
  // Groenten
  broccoli:             { kcal: 34,  protein: 3,  carbs: 5,  fat: 0, pieceGrams: 300 },
  spinazie:             { kcal: 23,  protein: 3,  carbs: 1,  fat: 0  },
  paprika:              { kcal: 31,  protein: 1,  carbs: 6,  fat: 0, pieceGrams: 150 },
  "rode paprika":       { kcal: 31,  protein: 1,  carbs: 6,  fat: 0, pieceGrams: 150 },
  "gele paprika":       { kcal: 31,  protein: 1,  carbs: 6,  fat: 0, pieceGrams: 150 },
  "groene paprika":     { kcal: 20,  protein: 1,  carbs: 4,  fat: 0, pieceGrams: 150 },
  komkommer:            { kcal: 15,  protein: 1,  carbs: 2,  fat: 0, pieceGrams: 300 },
  courgette:            { kcal: 17,  protein: 1,  carbs: 3,  fat: 0, pieceGrams: 250 },
  tomaat:               { kcal: 18,  protein: 1,  carbs: 3,  fat: 0, pieceGrams: 120 },
  kerstomaat:           { kcal: 18,  protein: 1,  carbs: 3,  fat: 0  },
  kerstomaatjes:        { kcal: 18,  protein: 1,  carbs: 3,  fat: 0  },
  cherrytomaatjes:      { kcal: 18,  protein: 1,  carbs: 3,  fat: 0  },
  wortel:               { kcal: 41,  protein: 1,  carbs: 10, fat: 0, pieceGrams: 80  },
  wortelen:             { kcal: 41,  protein: 1,  carbs: 10, fat: 0  },
  ui:                   { kcal: 40,  protein: 1,  carbs: 9,  fat: 0, pieceGrams: 120 },
  "rode ui":            { kcal: 40,  protein: 1,  carbs: 9,  fat: 0, pieceGrams: 100 },
  prei:                 { kcal: 61,  protein: 2,  carbs: 14, fat: 0, pieceGrams: 150 },
  sla:                  { kcal: 14,  protein: 1,  carbs: 2,  fat: 0  },
  romanosla:            { kcal: 14,  protein: 1,  carbs: 2,  fat: 0  },
  ijsbergsla:           { kcal: 14,  protein: 1,  carbs: 2,  fat: 0  },
  rucola:               { kcal: 25,  protein: 3,  carbs: 2,  fat: 0  },
  selderij:             { kcal: 14,  protein: 1,  carbs: 2,  fat: 0  },
  champignons:          { kcal: 22,  protein: 3,  carbs: 1,  fat: 0  },
  shiitake:             { kcal: 34,  protein: 2,  carbs: 7,  fat: 0  },
  portobello:           { kcal: 22,  protein: 3,  carbs: 3,  fat: 0  },
  erwtjes:              { kcal: 81,  protein: 5,  carbs: 14, fat: 0  },
  boontjes:             { kcal: 31,  protein: 2,  carbs: 6,  fat: 0  },
  sperziebonen:         { kcal: 31,  protein: 2,  carbs: 6,  fat: 0  },
  asperges:             { kcal: 20,  protein: 2,  carbs: 2,  fat: 0  },
  aardappelen:          { kcal: 77,  protein: 2,  carbs: 17, fat: 0, pieceGrams: 100 },
  aardappel:            { kcal: 77,  protein: 2,  carbs: 17, fat: 0, pieceGrams: 100 },
  "nieuwe aardappelen": { kcal: 70,  protein: 2,  carbs: 15, fat: 0  },
  "zoete aardappel":    { kcal: 86,  protein: 2,  carbs: 20, fat: 0, pieceGrams: 200 },
  bloemkool:            { kcal: 25,  protein: 2,  carbs: 5,  fat: 0, pieceGrams: 600 },
  mais:                 { kcal: 86,  protein: 3,  carbs: 19, fat: 1  },
  knoflook:             { kcal: 149, protein: 6,  carbs: 33, fat: 0, pieceGrams: 3   },
  gember:               { kcal: 80,  protein: 2,  carbs: 18, fat: 0  },
  avocado:              { kcal: 160, protein: 2,  carbs: 9,  fat: 15, pieceGrams: 180 },
  citroen:              { kcal: 29,  protein: 1,  carbs: 9,  fat: 0, pieceGrams: 100 },
  limoen:               { kcal: 30,  protein: 1,  carbs: 11, fat: 0, pieceGrams: 80  },
  aubergine:            { kcal: 25,  protein: 1,  carbs: 6,  fat: 0, pieceGrams: 200 },
  venkel:               { kcal: 31,  protein: 1,  carbs: 7,  fat: 0, pieceGrams: 200 },
  paksoi:               { kcal: 13,  protein: 1,  carbs: 2,  fat: 0  },
  "chinese kool":       { kcal: 13,  protein: 1,  carbs: 2,  fat: 0  },
  kool:                 { kcal: 25,  protein: 1,  carbs: 5,  fat: 0, pieceGrams: 800 },
  "rode kool":          { kcal: 31,  protein: 1,  carbs: 7,  fat: 0  },
  witlof:               { kcal: 17,  protein: 1,  carbs: 4,  fat: 0  },
  radijs:               { kcal: 16,  protein: 1,  carbs: 3,  fat: 0  },
  bieslook:             { kcal: 30,  protein: 3,  carbs: 4,  fat: 1  },
  peterselie:           { kcal: 36,  protein: 3,  carbs: 6,  fat: 1  },
  koriander:            { kcal: 23,  protein: 2,  carbs: 4,  fat: 1  },
  basilicum:            { kcal: 23,  protein: 3,  carbs: 3,  fat: 1  },
  munt:                 { kcal: 44,  protein: 3,  carbs: 9,  fat: 1  },
  dille:                { kcal: 43,  protein: 3,  carbs: 7,  fat: 1  },
  olijven:              { kcal: 145, protein: 1,  carbs: 4,  fat: 15 },
  bessen:               { kcal: 57,  protein: 1,  carbs: 14, fat: 0  },
  "gemengde bessen":    { kcal: 57,  protein: 1,  carbs: 14, fat: 0  },
  blauwebessen:         { kcal: 57,  protein: 1,  carbs: 14, fat: 0  },
  frambozen:            { kcal: 52,  protein: 1,  carbs: 12, fat: 0  },
  aardbeien:            { kcal: 32,  protein: 1,  carbs: 8,  fat: 0  },
  mango:                { kcal: 60,  protein: 1,  carbs: 15, fat: 0  },
  ananas:               { kcal: 50,  protein: 1,  carbs: 13, fat: 0  },
  appel:                { kcal: 52,  protein: 0,  carbs: 14, fat: 0, pieceGrams: 180 },
  banaan:               { kcal: 89,  protein: 1,  carbs: 23, fat: 0, pieceGrams: 120 },
  pompoen:              { kcal: 26,  protein: 1,  carbs: 7,  fat: 0  },
  // Vetten & noten
  olijfolie:            { kcal: 884, protein: 0,  carbs: 0,  fat: 100 },
  zonnebloemolie:       { kcal: 884, protein: 0,  carbs: 0,  fat: 100 },
  sesamolie:            { kcal: 884, protein: 0,  carbs: 0,  fat: 100 },
  kokosolie:            { kcal: 862, protein: 0,  carbs: 0,  fat: 100 },
  boter:                { kcal: 717, protein: 1,  carbs: 0,  fat: 81  },
  amandelen:            { kcal: 579, protein: 21, carbs: 22, fat: 50  },
  walnoten:             { kcal: 654, protein: 15, carbs: 14, fat: 65  },
  cashewnoten:          { kcal: 553, protein: 18, carbs: 30, fat: 44  },
  pijnboompitten:       { kcal: 673, protein: 14, carbs: 13, fat: 68  },
  sesamzaad:            { kcal: 573, protein: 18, carbs: 23, fat: 50  },
  chiazaad:             { kcal: 486, protein: 17, carbs: 42, fat: 31  },
  lijnzaad:             { kcal: 534, protein: 18, carbs: 29, fat: 42  },
  pindakaas:            { kcal: 588, protein: 25, carbs: 20, fat: 50  },
  tahini:               { kcal: 595, protein: 17, carbs: 21, fat: 54  },
  "pinda's":            { kcal: 567, protein: 26, carbs: 16, fat: 49  },
  pinda:                { kcal: 567, protein: 26, carbs: 16, fat: 49  },
  // Sauzen & condimenten
  tomatenpuree:         { kcal: 82,  protein: 4,  carbs: 15, fat: 0  },
  passata:              { kcal: 35,  protein: 2,  carbs: 7,  fat: 0  },
  "gepelde tomaten":    { kcal: 24,  protein: 1,  carbs: 4,  fat: 0  },
  tomatenblokjes:       { kcal: 24,  protein: 1,  carbs: 4,  fat: 0  },
  kokosmelk:            { kcal: 197, protein: 2,  carbs: 3,  fat: 21  },
  sojasaus:             { kcal: 53,  protein: 8,  carbs: 5,  fat: 0  },
  worcestersaus:        { kcal: 78,  protein: 1,  carbs: 18, fat: 0  },
  honing:               { kcal: 304, protein: 0,  carbs: 82, fat: 0  },
  mosterd:              { kcal: 66,  protein: 4,  carbs: 8,  fat: 3  },
  azijn:                { kcal: 21,  protein: 0,  carbs: 1,  fat: 0  },
  srirachasaus:         { kcal: 35,  protein: 1,  carbs: 8,  fat: 0  },
  teriyakisaus:         { kcal: 89,  protein: 5,  carbs: 17, fat: 0  },
  "tikka masala pasta": { kcal: 150, protein: 3,  carbs: 18, fat: 7  },
  misopasta:            { kcal: 199, protein: 12, carbs: 27, fat: 6  },
  currypasta:           { kcal: 160, protein: 4,  carbs: 18, fat: 8  },
  groentebouillon:      { kcal: 5,   protein: 0,  carbs: 1,  fat: 0  },
  kippenbouillon:       { kcal: 10,  protein: 1,  carbs: 1,  fat: 0  },
  bouillon:             { kcal: 8,   protein: 1,  carbs: 1,  fat: 0  },
  // Overig
  honing2:              { kcal: 304, protein: 0,  carbs: 82, fat: 0  },
  suiker:               { kcal: 400, protein: 0,  carbs: 100, fat: 0 },
  rozijnen:             { kcal: 299, protein: 3,  carbs: 79, fat: 0  },
};

const SORTED_KEYS = Object.keys(NUTRITION_DB).sort((a, b) => b.length - a.length);

function parseFraction(s: string): number {
  if (s === "½") return 0.5;
  if (s === "¼") return 0.25;
  if (s === "¾") return 0.75;
  if (s === "⅓") return 1 / 3;
  if (s === "⅔") return 2 / 3;
  return parseFloat(s.replace(",", ".")) || 0;
}

function findKey(text: string): string | null {
  const lower = text.toLowerCase().replace(/\(.*?\)/g, "").trim();
  for (const key of SORTED_KEYS) {
    if (lower.includes(key)) return key;
  }
  return null;
}

function parseIngredientLine(line: string): { grams: number; key: string } | null {
  const lower = line.trim().toLowerCase();

  // "3 teentjes knoflook" / "2 teentje knoflook"
  const cloveMatch = lower.match(/(\d+)\s*teentjes?\s+knoflook/);
  if (cloveMatch) return { grams: parseInt(cloveMatch[1]) * 3, key: "knoflook" };

  // "sap van (halve|een) citroen/limoen"
  if (lower.includes("sap van") && lower.includes("citroen")) return { grams: 30, key: "citroen" };
  if (lower.includes("sap van") && lower.includes("limoen")) return { grams: 25, key: "limoen" };

  // grams: "200g kipfilet" or "200 g kipfilet"
  let m = lower.match(/^([½¼¾⅓⅔]|\d+[,.]?\d*)\s*g\s+(.+)/);
  if (m) {
    const grams = parseFraction(m[1]);
    const key = findKey(m[2]);
    if (key && grams > 0) return { grams, key };
  }

  // ml: "400ml kokosmelk"
  m = lower.match(/^(\d+[,.]?\d*)\s*ml\s+(.+)/);
  if (m) {
    const grams = parseFraction(m[1]);
    const key = findKey(m[2]);
    if (key && grams > 0) return { grams, key };
  }

  // tablespoon: "2 el olijfolie"
  m = lower.match(/^([½¼¾⅓⅔]|\d+[,.]?\d*)\s*(?:el|eetlep[el]+s?)\s+(.+)/);
  if (m) {
    const grams = parseFraction(m[1]) * 13;
    const key = findKey(m[2]);
    if (key && grams > 0) return { grams, key };
  }

  // teaspoon: "1 tl komijn"
  m = lower.match(/^([½¼¾⅓⅔]|\d+[,.]?\d*)\s*(?:tl|theelepels?)\s+(.+)/);
  if (m) {
    const grams = parseFraction(m[1]) * 5;
    const key = findKey(m[2]);
    if (key && grams > 0) return { grams, key };
  }

  // piece count: "1 komkommer", "2 paprika's", "½ avocado"
  m = lower.match(/^([½¼¾⅓⅔]|\d+[,.]?\d*)\s+(.+)/);
  if (m) {
    const count = parseFraction(m[1]);
    const key = findKey(m[2]);
    if (key && count > 0) {
      const entry = NUTRITION_DB[key];
      const pieceGrams = entry.pieceGrams ?? 100;
      return { grams: count * pieceGrams, key };
    }
  }

  // fallback: find any matching key with default 50g
  const key = findKey(lower);
  if (key) return { grams: 50, key };

  return null;
}

export function calculateRecipeMacros(ingredients: string[]): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  let calories = 0, protein = 0, carbs = 0, fat = 0;
  for (const line of ingredients) {
    const parsed = parseIngredientLine(line);
    if (!parsed) continue;
    const entry = NUTRITION_DB[parsed.key];
    if (!entry) continue;
    const f = parsed.grams / 100;
    calories += entry.kcal * f;
    protein  += entry.protein * f;
    carbs    += entry.carbs * f;
    fat      += entry.fat * f;
  }
  return {
    calories: Math.round(calories),
    protein:  Math.round(protein),
    carbs:    Math.round(carbs),
    fat:      Math.round(fat),
  };
}
