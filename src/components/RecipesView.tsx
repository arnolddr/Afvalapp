"use client";

import { useState } from "react";
import { MealData } from "@/types";
import RecipeModal from "./RecipeModal";

// Import all recipes from the meal plan generator
const LUNCH_RECIPES = [
  { name: "Griekse salade met gegrilde kip", description: "Frisse salade met komkommer, tomaat, feta en gegrilde kipfilet.", baseCalories: 420, protein: 38, carbs: 18, fat: 20, ingredients: ["200g kipfilet", "100g fetakaas", "1 komkommer", "250g cherrytomaatjes", "1 rode ui", "handvol olijven", "2 el olijfolie", "sap van ½ citroen", "oregano, zout, peper"], instructions: ["Kruid de kip met zout, peper en oregano en grill 6 min per kant.", "Snijd komkommer, tomaten en rode ui en meng in een schaal.", "Voeg olijven en verkruimelde feta toe.", "Besprenkel met olijfolie en citroensap.", "Leg de gesneden kip bovenop en serveer."] },
  { name: "Linzensoep met volkorenbrood", description: "Hartige linzensoep met wortel, selderij en een snufje komijn.", baseCalories: 390, protein: 20, carbs: 55, fat: 8, ingredients: ["200g rode linzen", "2 wortelen", "2 stengels selderij", "1 ui", "2 teentjes knoflook", "1 blik gepelde tomaten", "1 tl komijn", "1 tl kurkuma", "1 liter groentebouillon", "2 sneetjes volkorenbrood"], instructions: ["Fruit ui en knoflook 3 min in olijfolie.", "Voeg wortel, selderij en kruiden toe, bak 2 min mee.", "Voeg linzen, tomaten en bouillon toe.", "Laat 25 min zachtjes koken tot linzen gaar zijn.", "Pureer de helft voor romigheid en serveer met brood."] },
  { name: "Tonijn wrap met avocado", description: "Volkoren wrap gevuld met tonijn, avocado, spinazie en yoghurtdressing.", baseCalories: 410, protein: 30, carbs: 35, fat: 18, ingredients: ["1 blik tonijn op water", "1 avocado", "2 volkoren wraps", "handvol spinazie", "4 el Griekse yoghurt", "sap van ½ citroen", "zout, peper, bieslook"], instructions: ["Meng tonijn met yoghurt, citroensap en bieslook.", "Prak avocado met een vork en breng op smaak.", "Leg spinazie op de wrap, smeer avocado erop.", "Verdeel tonijnmengsel erover en rol op.", "Snijd diagonaal door en serveer."] },
  { name: "Kwark met bessen en granola", description: "Eiwitrijke kwark met verse bessen, een lepel honing en krokante granola.", baseCalories: 360, protein: 25, carbs: 48, fat: 8, ingredients: ["300g magere kwark", "100g gemengde bessen", "40g low-sugar granola", "1 tl honing", "munt ter garnering"], instructions: ["Schep kwark in een kom.", "Verdeel bessen erover.", "Strooi granola erover en druppel honing erop.", "Garneer met munt en serveer direct."] },
  { name: "Caesar salade met ei", description: "Knapperige romaine sla met hardgekookt ei, parmezaan en lichte caesardressing.", baseCalories: 380, protein: 22, carbs: 15, fat: 26, ingredients: ["1 romanosla", "3 hardgekookte eieren", "30g parmezaan", "2 el olijfolie", "1 el citroensap", "1 tl dijonmosterd", "1 teentje knoflook", "worcestersaus, zout, peper", "volkorencroutons"], instructions: ["Kook eieren 8 min, schrik af en pel ze.", "Meng olijfolie, citroensap, mosterd, knoflook en worcestersaus tot dressing.", "Scheur sla in stukken en meng met dressing.", "Verdeel gesneden eieren erover.", "Rasp parmezaan erover en voeg croutons toe."] },
  { name: "Tomatensoep met hummus en brood", description: "Zelfgemaakte romige tomatensoep met verse basilicum en hartige hummus.", baseCalories: 370, protein: 14, carbs: 50, fat: 12, ingredients: ["500g rijpe tomaten", "1 blik gepelde tomaten", "1 ui", "2 teentjes knoflook", "2 el tomatenpuree", "500ml groentebouillon", "verse basilicum", "2 sneetjes volkorenbrood", "100g hummus"], instructions: ["Fruit ui en knoflook zacht.", "Voeg tomaten, puree en bouillon toe.", "Kook 20 min en pureer glad.", "Breng op smaak met zout, peper en basilicum.", "Serveer met brood en hummus."] },
  { name: "Eiersalade op roggebrood", description: "Romige eiersalade met kruidenyoghurt op knapperig roggebrood.", baseCalories: 350, protein: 22, carbs: 30, fat: 14, ingredients: ["4 hardgekookte eieren", "3 el Griekse yoghurt", "1 tl dijonmosterd", "bieslook, peterselie", "zout, peper", "4 sneetjes roggebrood", "sla en komkommer"], instructions: ["Kook eieren 8 min en hak grof.", "Meng met yoghurt, mosterd en kruiden.", "Breng op smaak.", "Beleg roggebrood met sla en komkommer.", "Verdeel eiersalade erover en serveer direct."] },
  { name: "Groentebouillon met volkoren pasta", description: "Lichte groentebouillon met kleine pasta en veel groenten.", baseCalories: 340, protein: 12, carbs: 52, fat: 6, ingredients: ["1.5 liter groentebouillon", "100g kleine volkoren pasta", "2 wortelen", "1 courgette", "100g erwtjes", "2 stengels selderij", "1 ui", "peterselie, zout, peper"], instructions: ["Snijd alle groenten in kleine stukjes.", "Breng bouillon aan de kook.", "Voeg ui, wortel en selderij toe, kook 10 min.", "Voeg pasta toe en kook 8 min.", "Voeg courgette en erwtjes toe, kook 3 min.", "Garneer met peterselie en serveer."] },
  { name: "Kippensoep met groenten", description: "Klassieke kippensoep met wortel, prei en vermicelli.", baseCalories: 360, protein: 28, carbs: 35, fat: 10, ingredients: ["200g gekookte kipfilet", "1.5 liter kippenbouillon", "2 wortelen", "1 prei", "100g vermicelli", "1 ui", "tijm, laurier, peterselie", "zout, peper"], instructions: ["Breng bouillon met ui, tijm en laurier aan de kook.", "Voeg gesneden wortel en prei toe, kook 15 min.", "Voeg vermicelli toe en kook 5 min.", "Voeg gesnipperde kip toe en verwarm door.", "Bestrooi met peterselie en serveer."] },
  { name: "Zalmwrap met komkommer en dille", description: "Lichte wrap met gerookte zalm, roomkaas en verse dille.", baseCalories: 400, protein: 26, carbs: 32, fat: 18, ingredients: ["100g gerookte zalm", "2 volkoren wraps", "100g light roomkaas", "½ komkommer", "verse dille", "sap van ½ citroen", "rucola", "zout, peper"], instructions: ["Smeer roomkaas op de wraps.", "Beleg met rucola en dun gesneden komkommer.", "Verdeel zalm erover en bestrooi met dille.", "Besprenkel met citroensap.", "Rol op, snijd doormidden en serveer."] },
];

const DINNER_RECIPES = [
  { name: "Zalm met geroosterde groenten en zoete aardappel", description: "Sappige zalmfilet met kleurrijke geroosterde groenten en zoete aardappelpuree.", baseCalories: 580, protein: 42, carbs: 45, fat: 22, ingredients: ["200g zalmfilet", "300g zoete aardappel", "1 courgette", "1 rode paprika", "1 broccoli", "2 el olijfolie", "knoflook, rozemarijn, zout, peper"], instructions: ["Verwarm oven op 200°C.", "Snijd groenten en schik op bakplaat, besprenkel met olijfolie en kruid.", "Rooster 20 min.", "Kook zoete aardappel gaar en stamp tot puree.", "Kruid zalm en bak 4 min per kant in koekenpan.", "Serveer zalm op de groenten met de puree ernaast."] },
  { name: "Kip tikka masala met bloemkoolrijst", description: "Romige tomatensaus met gekruide kip en lichte bloemkoolrijst.", baseCalories: 520, protein: 45, carbs: 22, fat: 28, ingredients: ["300g kipfilet in blokjes", "400ml kokosmelk (light)", "1 blik gepelde tomaten", "1 bloemkool", "2 el tikka masala pasta", "1 ui", "2 teentjes knoflook", "verse koriander"], instructions: ["Rasp bloemkool tot rijstkorrels en bak droog in pan, zet apart.", "Bak ui en knoflook glazig, voeg tikka pasta toe.", "Voeg kip toe en bak rondom bruin.", "Voeg tomaten en kokosmelk toe, sudder 15 min.", "Serveer met bloemkoolrijst en verse koriander."] },
  { name: "Gehaktballen in tomatensaus met spaghetti", description: "Zelfgemaakte gehaktballen in een rijke tomatensaus op volkoren spaghetti.", baseCalories: 560, protein: 38, carbs: 58, fat: 18, ingredients: ["300g mager rundergehakt", "180g volkoren spaghetti", "2 blikken gepelde tomaten", "1 ui", "3 teentjes knoflook", "1 ei", "2 el paneermeel", "basilicum, oregano, zout, peper"], instructions: ["Meng gehakt met ei, paneermeel, zout en peper en rol tot ballen.", "Bak gehaktballen rondom bruin en zet apart.", "Fruit ui en knoflook, voeg tomaten en kruiden toe.", "Laat saus 20 min sudderen, voeg gehaktballen toe.", "Kook spaghetti al dente en serveer met saus."] },
  { name: "Gevulde paprika's met quinoa en groenten", description: "Kleurrijke paprika's gevuld met quinoa, zwarte bonen, maïs en kruiden.", baseCalories: 490, protein: 22, carbs: 62, fat: 14, ingredients: ["4 paprika's", "200g quinoa", "1 blik zwarte bonen", "150g maïs", "1 ui", "2 teentjes knoflook", "komijn, chilipoeder", "100g geraspte kaas (light)", "verse peterselie"], instructions: ["Verwarm oven op 190°C.", "Kook quinoa gaar.", "Fruit ui en knoflook, voeg bonen, maïs en kruiden toe.", "Meng met quinoa.", "Halveer paprika's en verwijder zaadjes.", "Vul met quinoamengsel en bestrooi met kaas.", "Bak 25 min in oven tot paprika zacht is."] },
  { name: "Wokschotel kip met groenten en zilvervliesrijst", description: "Snelle roerbakschotel met kip, broccoli, wortel en een umami-saus.", baseCalories: 530, protein: 40, carbs: 55, fat: 14, ingredients: ["250g kipfilet in reepjes", "180g zilvervliesrijst", "1 broccoli", "2 wortelen", "1 paprika", "3 el sojasaus (laag zout)", "1 el sesamolie", "2 teentjes knoflook", "verse gember", "sesamzaad"], instructions: ["Kook rijst volgens verpakking.", "Verhit wok op hoog vuur met sesamolie.", "Bak kip al roerend gaar, zet apart.", "Wok groenten 4 min, voeg knoflook en gember toe.", "Voeg kip en sojasaus terug, roerbak 2 min.", "Serveer op rijst en bestrooi met sesamzaad."] },
  { name: "Gegrilde tilapia met asperges en aardappelen", description: "Lichte gegrilde tilapia met groene asperges en kleine aardappeltjes.", baseCalories: 510, protein: 44, carbs: 40, fat: 16, ingredients: ["200g tilapiafilet", "300g groene asperges", "300g kleine aardappelen", "2 el olijfolie", "citroen", "dille, zout, peper"], instructions: ["Kook aardappelen 15 min, halveer ze daarna.", "Breek harde onderkant van asperges af.", "Kruid tilapia met dille, zout, peper en citroensap.", "Grill vis 3-4 min per kant op grillpan.", "Rooster aardappelen en asperges in olijfolie 10 min in oven op 200°C.", "Serveer vis met groenten en een partje citroen."] },
  { name: "Zelfgemaakte groentepizza op volkoren bodem", description: "Dunne volkoren pizza belegd met groenten, mozzarella en verse basilicum.", baseCalories: 540, protein: 28, carbs: 62, fat: 18, ingredients: ["2 volkoren pizzabodems", "200ml passata", "125g mozzarella (light)", "1 courgette", "1 paprika", "100g champignons", "rode ui", "verse basilicum", "oregano, zout, peper"], instructions: ["Verwarm oven op 220°C.", "Smeer passata op bodems.", "Snijd groenten dun en verdeel erover.", "Scheur mozzarella in stukken en verdeel.", "Bestrooi met oregano en bak 12-15 min.", "Garneer met verse basilicum voor serveren."] },
  { name: "Stoofpotje kikkererwten met spinazie", description: "Vegetarisch stoofpotje met kikkererwten, spinazie en Marokkaanse kruiden.", baseCalories: 470, protein: 20, carbs: 58, fat: 14, ingredients: ["2 blikken kikkererwten", "300g verse spinazie", "1 blik gepelde tomaten", "1 ui", "3 teentjes knoflook", "ras el hanout, komijn, paprikapoeder", "200g volkoren couscous", "verse koriander"], instructions: ["Fruit ui en knoflook in olijfolie.", "Voeg kruiden toe en bak 1 min.", "Voeg tomaten en kikkererwten toe, sudder 15 min.", "Voeg spinazie toe en laat slinken.", "Bereid couscous volgens verpakking.", "Serveer stoofpotje op couscous met koriander."] },
  { name: "Kabeljauw in papillot met groenten", description: "Gezonde kabeljauw gegaard in aluminiumfolie met seizoensgroenten.", baseCalories: 480, protein: 46, carbs: 38, fat: 14, ingredients: ["200g kabeljauwfilet", "200g boontjes", "2 wortelen", "1 courgette", "4 kerstomaatjes", "2 el olijfolie", "citroen", "tijm, rozemarijn, zout, peper", "300g nieuwe aardappelen"], instructions: ["Verwarm oven op 190°C.", "Kook aardappelen 15 min.", "Snijd groenten en leg op vel aluminiumfolie.", "Leg vis bovenop, besprenkel met olijfolie en kruid.", "Vouw folie dicht en bak 18-20 min.", "Serveer direct uit het pakketje."] },
  { name: "Turkse köfte met tzatziki en rijst", description: "Gekruide gehaktrolletjes met verfrissende tzatziki en zilvervliesrijst.", baseCalories: 550, protein: 38, carbs: 50, fat: 20, ingredients: ["300g mager rundergehakt", "180g zilvervliesrijst", "1 ui (geraspt)", "2 teentjes knoflook", "komijn, koriander, paprikapoeder", "200g Griekse yoghurt", "½ komkommer", "verse munt en dille", "zout, peper"], instructions: ["Meng gehakt met ui, knoflook en kruiden.", "Vorm kleine rolletjes en grill 10-12 min op grillpan.", "Rasp komkommer, knijp vocht eruit.", "Meng met yoghurt, munt, dille en knoflook tot tzatziki.", "Kook rijst gaar.", "Serveer köfte op rijst met tzatziki."] },
];

type Filter = "alles" | "lunch" | "diner";

function toMealData(r: typeof LUNCH_RECIPES[0], type: "lunch" | "dinner"): MealData {
  return {
    id: 0, day: "", dayIndex: 0,
    type,
    name: r.name,
    description: r.description,
    calories: r.baseCalories,
    protein: r.protein,
    carbs: r.carbs,
    fat: r.fat,
    ingredients: r.ingredients,
    instructions: r.instructions,
  };
}

export default function RecipesView() {
  const [filter, setFilter] = useState<Filter>("alles");
  const [selected, setSelected] = useState<MealData | null>(null);

  const all = [
    ...LUNCH_RECIPES.map((r) => toMealData(r, "lunch")),
    ...DINNER_RECIPES.map((r) => toMealData(r, "dinner")),
  ];
  const visible = all.filter(
    (r) =>
      filter === "alles" ||
      (filter === "lunch" && r.type === "lunch") ||
      (filter === "diner" && r.type === "dinner")
  );

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(["alles", "lunch", "diner"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "bg-green-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f === "alles" ? "Alles" : f === "lunch" ? "☀️ Lunch" : "🌙 Diner"}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-400 self-center">
          {visible.length} recepten
        </span>
      </div>

      <div className="grid gap-3">
        {visible.map((meal, i) => (
          <button
            key={i}
            onClick={() => setSelected(meal)}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left hover:bg-green-50 hover:border-green-200 transition-colors group"
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs">{meal.type === "lunch" ? "☀️" : "🌙"}</span>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {meal.type === "lunch" ? "Lunch" : "Diner"}
                  </span>
                </div>
                <p className="font-semibold text-gray-900 group-hover:text-green-700 truncate">
                  {meal.name}
                </p>
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {meal.description}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-orange-600">
                  {meal.calories} kcal
                </p>
                <div className="flex gap-2 text-xs text-gray-400 mt-0.5">
                  <span>E {meal.protein}g</span>
                  <span>K {meal.carbs}g</span>
                  <span>V {meal.fat}g</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <RecipeModal meal={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
