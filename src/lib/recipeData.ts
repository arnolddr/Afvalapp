// Base calories per recipe (per person, at recipe-as-written quantities).
// Used to scale ingredients when meal.baseCalories is not stored (old plans).
export const RECIPE_BASE_CALORIES: Record<string, number> = {
  // Lunches
  "Griekse salade met gegrilde kip": 420,
  "Linzensoep met volkorenbrood": 390,
  "Tonijn wrap met avocado": 410,
  "Kwark met bessen en granola": 360,
  "Caesar salade met ei": 380,
  "Tomatensoep met hummus en brood": 370,
  "Eiersalade op roggebrood": 350,
  "Groentebouillon met volkoren pasta": 340,
  "Kippensoep met groenten": 360,
  "Zalmwrap met komkommer en dille": 400,
  // Dinners
  "Zalm met geroosterde groenten en zoete aardappel": 580,
  "Kip tikka masala met bloemkoolrijst": 520,
  "Gehaktballen in tomatensaus met spaghetti": 560,
  "Gevulde paprika's met quinoa en groenten": 490,
  "Wokschotel kip met groenten en zilvervliesrijst": 530,
  "Gegrilde tilapia met asperges en aardappelen": 510,
  "Zelfgemaakte groentepizza op volkoren bodem": 540,
  "Stoofpotje kikkererwten met spinazie": 470,
  "Kabeljauw in papillot met groenten": 480,
  "Turkse köfte met tzatziki en rijst": 550,
};
