export interface Snack {
  name: string;
  calories: number;
  protein: number;
  ingredients: string[];
}

export const SNACKS: Snack[] = [
  {
    name: "Appel met pindakaas",
    calories: 180, protein: 5,
    ingredients: ["1 appel", "1 el pindakaas (naturel)"],
  },
  {
    name: "Handje ongezouten amandelen (25g)",
    calories: 155, protein: 5,
    ingredients: ["25g ongezouten amandelen"],
  },
  {
    name: "Magere kwark met blauwe bessen",
    calories: 130, protein: 15,
    ingredients: ["150g magere kwark", "50g blauwe bessen"],
  },
  {
    name: "Wortel & komkommer met hummus",
    calories: 120, protein: 4,
    ingredients: ["1 wortel", "½ komkommer", "2 el hummus"],
  },
  {
    name: "Banaan",
    calories: 90, protein: 1,
    ingredients: ["1 banaan"],
  },
  {
    name: "Rijstwafel met avocado",
    calories: 140, protein: 2,
    ingredients: ["2 rijstwafels", "½ avocado", "zout, peper"],
  },
  {
    name: "Hardgekookt ei",
    calories: 70, protein: 6,
    ingredients: ["1 ei"],
  },
  {
    name: "Griekse yoghurt met honing",
    calories: 140, protein: 10,
    ingredients: ["150g Griekse yoghurt (0%)", "1 tl honing"],
  },
  {
    name: "Handje druiven (100g)",
    calories: 70, protein: 1,
    ingredients: ["100g druiven"],
  },
  {
    name: "Edamame bonen (100g)",
    calories: 120, protein: 11,
    ingredients: ["100g edamame bonen"],
  },
];

// Select 14 snacks for the week (2 per day) for a given profile
export function weekSnacks(profileName: string, weekSeed: number): Snack[] {
  const seed = weekSeed + profileName.charCodeAt(0);
  const selected: Snack[] = [];
  let s = seed;
  for (let i = 0; i < 14; i++) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    selected.push(SNACKS[Math.abs(s) % SNACKS.length]);
  }
  return selected;
}
