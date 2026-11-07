export const SECTIONS = [
  { id: 'veg', label: '채소·과일' },
  { id: 'meat', label: '육류·계란' },
  { id: 'fish', label: '수산' },
  { id: 'tofu_dairy', label: '두부·유제품' },
  { id: 'grain', label: '곡류·기타' },
];

const FRACTIONS = [[0.2, '1/5'], [0.25, '1/4'], [0.3, '1/3'], [0.5, '1/2']];
const round2 = (n) => Math.round(n * 100) / 100;

export function formatAmount(qty, unit) {
  if (unit === 'g' || unit === 'ml') return `${round2(qty)}${unit}`;
  if (qty < 0.2) return '조금';
  const frac = FRACTIONS.find(([v]) => Math.abs(v - qty) < 1e-9);
  return `${frac ? frac[1] : round2(qty)}${unit}`;
}

export function kurlyUrl(ingredient) {
  return 'https://www.kurly.com/search?sword=' + encodeURIComponent(ingredient.kurly || ingredient.name);
}

export function buildShoppingList({ plan, recipes, ingredients }) {
  const recipeById = new Map(recipes.map((r) => [r.id, r]));
  const ingById = new Map(ingredients.map((i) => [i.id, i]));
  const totals = new Map();
  const pantry = new Map();

  for (const day of plan.days) {
    for (const slots of Object.values(day)) {
      for (const slot of slots) {
        const recipe = slot.recipeId && recipeById.get(slot.recipeId);
        if (!recipe) continue;
        for (const it of recipe.items) {
          const ing = ingById.get(it.id);
          if (!ing) continue;
          if (ing.pantry) pantry.set(ing.id, { id: ing.id, name: ing.name });
          else totals.set(ing.id, (totals.get(ing.id) ?? 0) + (it.qty ?? 0));
        }
      }
    }
  }

  const sections = SECTIONS.map(({ id, label }) => {
    const items = [...totals]
      .map(([ingId, total]) => ({ ing: ingById.get(ingId), total }))
      .filter(({ ing }) => ing.section === id)
      .map(({ ing, total }) => {
        const amount = round2(Math.ceil(total / ing.buyStep - 1e-9) * ing.buyStep);
        return { id: ing.id, name: ing.name, qtyText: `${amount}${ing.unit}`, kurlyUrl: kurlyUrl(ing) };
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    return { id, label, items };
  }).filter((s) => s.items.length > 0);

  return { sections, pantry: [...pantry.values()].sort((a, b) => a.name.localeCompare(b.name, 'ko')) };
}
