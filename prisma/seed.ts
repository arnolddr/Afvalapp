import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  // Seed weight entries
  await prisma.weightEntry.createMany({
    data: [
      { weight: 92.4, date: new Date("2026-04-07") },
      { weight: 91.8, date: new Date("2026-04-10") },
      { weight: 91.1, date: new Date("2026-04-14") },
      { weight: 90.6, date: new Date("2026-04-17") },
      { weight: 90.0, date: new Date("2026-04-21") },
      { weight: 89.5, date: new Date("2026-04-23") },
    ],
  });

  // Seed a meal plan (week: zat 26 apr – vri 2 mei 2026)
  const weekStart = new Date("2026-04-26");
  const weekEnd   = new Date("2026-05-02");

  const existing = await prisma.mealPlan.findFirst({ where: { weekStart } });
  if (existing) {
    console.log("Seed data already present, skipping meal plan.");
    return;
  }

  await prisma.mealPlan.create({
    data: {
      weekStart,
      weekEnd,
      weight: 89.5,
      targetCalories: 1948,
      meals: {
        create: [
          // Zaterdag
          {
            day: "Zaterdag", dayIndex: 0, type: "lunch",
            name: "Griekse salade met gegrilde kip",
            description: "Frisse salade met komkommer, tomaat, feta en gegrilde kipfilet.",
            calories: 420, protein: 38, carbs: 18, fat: 20,
            ingredients: JSON.stringify(["200g kipfilet","100g fetakaas","1 komkommer","250g cherrytomaatjes","1 rode ui","handvol olijven","2 el olijfolie","sap van ½ citroen","oregano, zout, peper"]),
            instructions: JSON.stringify(["Kruid de kip met zout, peper en oregano en grill 6 min per kant.","Snijd komkommer, tomaten en rode ui en meng in een schaal.","Voeg olijven en verkruimelde feta toe.","Besprenkel met olijfolie en citroensap.","Leg de gesneden kip bovenop en serveer."]),
          },
          {
            day: "Zaterdag", dayIndex: 0, type: "dinner",
            name: "Zalm met geroosterde groenten en zoete aardappel",
            description: "Sappige zalmfilet met kleurrijke geroosterde groenten en zoete aardappelpuree.",
            calories: 580, protein: 42, carbs: 45, fat: 22,
            ingredients: JSON.stringify(["200g zalmfilet","300g zoete aardappel","1 courgette","1 rode paprika","1 broccoli","2 el olijfolie","knoflook, rozemarijn, zout, peper"]),
            instructions: JSON.stringify(["Verwarm oven op 200°C.","Snijd groenten en schik op bakplaat, besprenkel met olijfolie en kruid.","Rooster 20 min.","Kook zoete aardappel gaar en stamp tot puree.","Kruid zalm en bak 4 min per kant in koekenpan.","Serveer zalm op de groenten met de puree ernaast."]),
          },
          // Zondag
          {
            day: "Zondag", dayIndex: 1, type: "lunch",
            name: "Linzensoep met volkorenbrood",
            description: "Hartige linzensoep met wortel, selderij en een snufje komijn.",
            calories: 390, protein: 20, carbs: 55, fat: 8,
            ingredients: JSON.stringify(["200g rode linzen","2 wortelen","2 stengels selderij","1 ui","2 teentjes knoflook","1 blik gepelde tomaten","1 tl komijn","1 tl kurkuma","1 liter groentebouillon","2 sneetjes volkorenbrood"]),
            instructions: JSON.stringify(["Fruit ui en knoflook 3 min in olijfolie.","Voeg wortel, selderij en kruiden toe, bak 2 min mee.","Voeg linzen, tomaten en bouillon toe.","Laat 25 min zachtjes koken tot linzen gaar zijn.","Pureer de helft van de soep voor romigheid.","Serveer met volkorenbrood."]),
          },
          {
            day: "Zondag", dayIndex: 1, type: "dinner",
            name: "Kip tikka masala met bloemkoolrijst",
            description: "Romige tomatensaus met gekruide kip en lichte bloemkoolrijst.",
            calories: 520, protein: 45, carbs: 22, fat: 28,
            ingredients: JSON.stringify(["300g kipfilet in blokjes","400ml kokosmelk (light)","1 blik gepelde tomaten","1 bloemkool","2 el tikka masala pasta","1 ui","2 teentjes knoflook","verse koriander"]),
            instructions: JSON.stringify(["Rasp bloemkool tot rijstkorrels en bak droog in pan, zet apart.","Bak ui en knoflook glazig, voeg tikka pasta toe.","Voeg kip toe en bak rondom bruin.","Voeg tomaten en kokosmelk toe, sudder 15 min.","Serveer met bloemkoolrijst en verse koriander."]),
          },
          // Maandag
          {
            day: "Maandag", dayIndex: 2, type: "lunch",
            name: "Tonijn wrap met avocado",
            description: "Volkoren wrap gevuld met tonijn, avocado, spinazie en yoghurtdressing.",
            calories: 410, protein: 30, carbs: 35, fat: 18,
            ingredients: JSON.stringify(["1 blik tonijn op water","1 avocado","2 volkoren wraps","handvol spinazie","4 el Griekse yoghurt","sap van ½ citroen","zout, peper, bieslook"]),
            instructions: JSON.stringify(["Meng tonijn met yoghurt, citroensap en bieslook.","Prak avocado met een vork en breng op smaak.","Leg spinazie op de wrap, smeer avocado erop.","Verdeel tonijnmengsel erover en rol op.","Snijd diagonaal door."]),
          },
          {
            day: "Maandag", dayIndex: 2, type: "dinner",
            name: "Gehaktballen in tomatensaus met spaghetti",
            description: "Zelfgemaakte gehaktballen in een rijke tomatensaus op volkoren spaghetti.",
            calories: 560, protein: 38, carbs: 58, fat: 18,
            ingredients: JSON.stringify(["300g mager rundergehakt","180g volkoren spaghetti","2 blikken gepelde tomaten","1 ui","3 teentjes knoflook","1 ei","2 el paneermeel","basilicum, oregano, zout, peper"]),
            instructions: JSON.stringify(["Meng gehakt met ei, paneermeel, zout en peper en rol tot ballen.","Bak gehaktballen rondom bruin en zet apart.","Fruit ui en knoflook, voeg tomaten en kruiden toe.","Laat saus 20 min sudderen, voeg gehaktballen toe.","Kook spaghetti al dente en serveer met saus."]),
          },
          // Dinsdag
          {
            day: "Dinsdag", dayIndex: 3, type: "lunch",
            name: "Kwark met bessen en granola",
            description: "Eiwitrijke kwark met verse bessen, een lepel honing en krokante granola.",
            calories: 360, protein: 25, carbs: 48, fat: 8,
            ingredients: JSON.stringify(["300g magere kwark","100g gemengde bessen","40g low-sugar granola","1 tl honing","munt ter garnering"]),
            instructions: JSON.stringify(["Schep kwark in een kom.","Verdeel bessen erover.","Strooi granola erover en druppel honing erop.","Garneer met munt en serveer direct."]),
          },
          {
            day: "Dinsdag", dayIndex: 3, type: "dinner",
            name: "Gevulde paprika's met quinoa en groenten",
            description: "Kleurrijke paprika's gevuld met quinoa, zwarte bonen, maïs en kruiden.",
            calories: 490, protein: 22, carbs: 62, fat: 14,
            ingredients: JSON.stringify(["4 paprika's","200g quinoa","1 blik zwarte bonen","150g maïs","1 ui","2 teentjes knoflook","komijn, chilipoeder","100g geraspte kaas (light)","verse peterselie"]),
            instructions: JSON.stringify(["Verwarm oven op 190°C.","Kook quinoa gaar.","Fruit ui en knoflook, voeg bonen, maïs en kruiden toe.","Meng met quinoa.","Halveer paprika's en verwijder zaadjes.","Vul met quinoamengsel en bestrooi met kaas.","Bak 25 min in oven tot paprika zacht is."]),
          },
          // Woensdag
          {
            day: "Woensdag", dayIndex: 4, type: "lunch",
            name: "Caesar salade met ei",
            description: "Knapperige romaine sla met hardgekookt ei, parmezaan en lichte caesardressing.",
            calories: 380, protein: 22, carbs: 15, fat: 26,
            ingredients: JSON.stringify(["1 romanosla","3 hardgekookte eieren","30g parmezaan","2 el olijfolie","1 el citroensap","1 tl dijonmosterd","1 teentje knoflook","worcestersaus, zout, peper","volkorencroutons"]),
            instructions: JSON.stringify(["Kook eieren 8 min, schrik af en pel ze.","Meng olijfolie, citroensap, mosterd, knoflook en worcestersaus tot dressing.","Scheur sla in stukken en meng met dressing.","Verdeel in stukken gesneden eieren erover.","Rasp parmezaan erover en voeg croutons toe."]),
          },
          {
            day: "Woensdag", dayIndex: 4, type: "dinner",
            name: "Wokschotel kip met groenten en zilvervliesrijst",
            description: "Snelle roerbakschotel met kip, broccoli, wortel en een umami-saus.",
            calories: 530, protein: 40, carbs: 55, fat: 14,
            ingredients: JSON.stringify(["250g kipfilet in reepjes","180g zilvervliesrijst","1 broccoli","2 wortelen","1 paprika","3 el sojasaus (laag zout)","1 el sesamolie","2 teentjes knoflook","verse gember","sesamzaad"]),
            instructions: JSON.stringify(["Kook rijst volgens verpakking.","Verhit wok op hoog vuur met sesamolie.","Bak kip al roerend gaar, zet apart.","Wok groenten 4 min, voeg knoflook en gember toe.","Voeg kip en sojasaus terug, roerbak 2 min.","Serveer op rijst en bestrooi met sesamzaad."]),
          },
          // Donderdag
          {
            day: "Donderdag", dayIndex: 5, type: "lunch",
            name: "Tomatensoep met volkoren brood en hummus",
            description: "Zelfgemaakte romige tomatensoep met verse basilicum en hartige hummus.",
            calories: 370, protein: 14, carbs: 50, fat: 12,
            ingredients: JSON.stringify(["500g rijpe tomaten","1 blik gepelde tomaten","1 ui","2 teentjes knoflook","2 el tomatenpuree","500ml groentebouillon","verse basilicum","2 sneetjes volkorenbrood","100g hummus"]),
            instructions: JSON.stringify(["Fruit ui en knoflook zacht.","Voeg tomaten, puree en bouillon toe.","Kook 20 min en pureer glad.","Breng op smaak met zout, peper en basilicum.","Serveer met brood en hummus."]),
          },
          {
            day: "Donderdag", dayIndex: 5, type: "dinner",
            name: "Gegrilde tilapia met asperges en aardappelen",
            description: "Lichte gegrilde tilapia met groene asperges en kleine aardappeltjes.",
            calories: 510, protein: 44, carbs: 40, fat: 16,
            ingredients: JSON.stringify(["200g tilapiafilet","300g groene asperges","300g kleine aardappelen","2 el olijfolie","citroen","dille, zout, peper"]),
            instructions: JSON.stringify(["Kook aardappelen 15 min, halveer ze daarna.","Breek harde onderkant van asperges af.","Kruid tilapia met dille, zout, peper en citroensap.","Grill vis 3-4 min per kant op grillpan.","Rooster aardappelen en asperges in olijfolie 10 min in oven op 200°C.","Serveer vis met groenten en een partje citroen."]),
          },
          // Vrijdag
          {
            day: "Vrijdag", dayIndex: 6, type: "lunch",
            name: "Eiersalade op roggebrood",
            description: "Romige eiersalade met kruidenyoghurt op knapperig roggebrood.",
            calories: 350, protein: 22, carbs: 30, fat: 14,
            ingredients: JSON.stringify(["4 hardgekookte eieren","3 el Griekse yoghurt","1 tl dijonmosterd","bieslook, peterselie","zout, peper","4 sneetjes roggebrood","sla en komkommer"]),
            instructions: JSON.stringify(["Kook eieren 8 min en hak grof.","Meng met yoghurt, mosterd en kruiden.","Breng op smaak.","Beleg roggebrood met sla en komkommer.","Verdeel eiersalade erover en serveer direct."]),
          },
          {
            day: "Vrijdag", dayIndex: 6, type: "dinner",
            name: "Zelfgemaakte groentepizza op volkoren bodem",
            description: "Dunne volkoren pizza belegd met groenten, mozzarella en verse basilicum.",
            calories: 540, protein: 28, carbs: 62, fat: 18,
            ingredients: JSON.stringify(["2 volkoren pizzabodems (kant-en-klaar)","200ml passata","125g mozzarella (light)","1 courgette","1 paprika","100g champignons","rode ui","verse basilicum","oregano, zout, peper"]),
            instructions: JSON.stringify(["Verwarm oven op 220°C.","Smeer passata op bodems.","Snijd groenten dun en verdeel erover.","Scheur mozzarella in stukken en verdeel.","Bestrooi met oregano en bak 12-15 min.","Garneer met verse basilicum voor serveren."]),
          },
        ],
      },
    },
  });

  console.log("Seed data aangemaakt!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
