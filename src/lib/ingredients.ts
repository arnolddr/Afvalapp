// Scale a single ingredient line by a factor (e.g. "200g kipfilet" x2 -> "400g kipfilet")
export function scaleIngredient(ingredient: string, factor: number): string {
  if (factor === 1) return ingredient;

  // Handle fractions: ½, ¼, ¾, ⅓, ⅔
  const fractionMap: Record<string, number> = {
    "½": 0.5, "¼": 0.25, "¾": 0.75,
    "⅓": 0.3333, "⅔": 0.6667,
  };

  // Match: optional number (int/float/fraction) + optional unit + rest
  // Examples: "200g kip", "1 komkommer", "½ citroen", "2 el olijfolie", "1.5 liter"
  const match = ingredient.match(
    /^([½¼¾⅓⅔]|\d+(?:[.,]\d+)?)\s*(g|kg|ml|l|liter|el|tl|el\.|tl\.)?\s*(.*)$/i
  );
  if (!match) return ingredient;

  const [, numStr, unit, rest] = match;
  let num: number;
  if (fractionMap[numStr]) {
    num = fractionMap[numStr];
  } else {
    num = parseFloat(numStr.replace(",", "."));
  }
  if (isNaN(num)) return ingredient;

  const scaled = num * factor;
  // Prefer integer display when possible
  const display = Number.isInteger(scaled)
    ? scaled.toString()
    : scaled.toFixed(1).replace(/\.0$/, "");

  return `${display}${unit ? (unit.match(/^(g|kg|ml|l)$/i) ? unit : " " + unit) : ""} ${rest}`.trim();
}

export function scaleIngredients(ingredients: string[], factor: number): string[] {
  return ingredients.map((i) => scaleIngredient(i, factor));
}
