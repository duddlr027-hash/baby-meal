export const DAYS = 7;
export const MEALS = ['breakfast', 'dinner'];
export const MEAL_STRUCTURE = { breakfast: ['main', 'side'], dinner: ['main', 'side', 'side', 'soup'] };
export const MEAL_LABEL = { breakfast: '아침', dinner: '저녁' };
export const TYPE_LABEL = { main: '밥·죽·면', side: '반찬', soup: '국' };
export const PROTEIN_LABEL = { beef: '소고기', chicken: '닭고기', pork: '돼지고기', fish: '생선', tofu: '두부', egg: '계란' };
export const TARGETS = { beef: 3, fish: 2 };
export const RELAX_WARNING = '제외 재료가 많아 일부 메뉴가 반복돼요';
const MAX_WEEKLY_USES = 2;

export function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function emptyPlan() {
  return {
    days: Array.from({ length: DAYS }, () => ({
      breakfast: MEAL_STRUCTURE.breakfast.map((type) => ({ type, recipeId: null, pinned: false })),
      dinner: MEAL_STRUCTURE.dinner.map((type) => ({ type, recipeId: null, pinned: false })),
    })),
    warnings: [],
  };
}

const clone = (p) => JSON.parse(JSON.stringify(p));

function makeCtx({ recipes, ingredients, excluded = [] }) {
  return {
    recipes,
    recipeById: new Map(recipes.map((r) => [r.id, r])),
    ingById: new Map(ingredients.map((i) => [i.id, i])),
    excluded: new Set(excluded),
  };
}

function isAllowed(recipe, ctx) {
  return !recipe.items.some((it) => ctx.excluded.has(it.id));
}

function baseCandidates(ctx, meal, type) {
  return ctx.recipes.filter((r) => r.type === type && r.meals.includes(meal) && isAllowed(r, ctx));
}

function* positions(plan) {
  for (let d = 0; d < plan.days.length; d++)
    for (const meal of MEALS)
      for (let s = 0; s < plan.days[d][meal].length; s++) yield { dayIndex: d, meal, slotIndex: s };
}

const samePos = (a, b) => a.dayIndex === b.dayIndex && a.meal === b.meal && a.slotIndex === b.slotIndex;
const slotAt = (plan, p) => plan.days[p.dayIndex][p.meal][p.slotIndex];

// pos를 뺀 나머지 채워진 슬롯들
function others(plan, pos) {
  const out = [];
  for (const p of positions(plan)) {
    if (samePos(p, pos)) continue;
    const id = slotAt(plan, p).recipeId;
    if (id) out.push({ ...p, recipeId: id });
  }
  return out;
}

function analyze(recipe, pos, rest, ctx) {
  const same = rest.filter((o) => o.recipeId === recipe.id);
  const otherMeal = pos.meal === 'breakfast' ? 'dinner' : 'breakfast';
  let proteinClash = null;
  if (recipe.type === 'main' && recipe.protein !== 'none') {
    const clash = rest.some((o) => {
      if (o.dayIndex !== pos.dayIndex || o.meal !== otherMeal) return false;
      const r = ctx.recipeById.get(o.recipeId);
      return r?.type === 'main' && r.protein === recipe.protein;
    });
    if (clash) proteinClash = otherMeal;
  }
  return {
    uses: same.length,
    sameMeal: same.some((o) => o.dayIndex === pos.dayIndex && o.meal === pos.meal),
    sameDay: same.some((o) => o.dayIndex === pos.dayIndex && o.meal !== pos.meal),
    yesterday: same.some((o) => o.dayIndex === pos.dayIndex - 1),
    tomorrow: same.some((o) => o.dayIndex === pos.dayIndex + 1),
    proteinClash,
  };
}

function weightOf(recipe, rest, ctx) {
  let w = 1;
  const counts = { beef: 0, fish: 0 };
  const usedVeg = new Set();
  for (const o of rest) {
    const r = ctx.recipeById.get(o.recipeId);
    if (!r) continue;
    if (r.protein in counts) counts[r.protein] += 1;
    for (const it of r.items) if (ctx.ingById.get(it.id)?.section === 'veg') usedVeg.add(it.id);
  }
  if (recipe.protein in TARGETS && counts[recipe.protein] < TARGETS[recipe.protein]) w += 3;
  if (recipe.items.some((it) => usedVeg.has(it.id))) w += 1;
  return w;
}

function pick(plan, pos, ctx, rng, excludeIds = []) {
  const type = slotAt(plan, pos).type;
  const rest = others(plan, pos);
  const cands = baseCandidates(ctx, pos.meal, type)
    .filter((r) => !excludeIds.includes(r.id))
    .map((r) => ({ r, a: analyze(r, pos, rest, ctx) }))
    .filter((c) => !c.a.sameMeal);
  if (!cands.length) return { recipeId: null, relaxed: false };

  const weeklyOk = (c) => c.a.uses < MAX_WEEKLY_USES && !c.a.sameDay && !c.a.yesterday && !c.a.tomorrow;
  let pool = cands.filter((c) => weeklyOk(c) && !c.a.proteinClash);
  let relaxed = false;
  if (!pool.length) { pool = cands.filter(weeklyOk); relaxed = true; }
  if (!pool.length) { pool = cands; relaxed = true; }

  const weights = pool.map((c) => weightOf(c.r, rest, ctx));
  let x = rng() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) {
    x -= weights[i];
    if (x < 0) return { recipeId: pool[i].r.id, relaxed };
  }
  return { recipeId: pool[pool.length - 1].r.id, relaxed };
}

// shouldRefill(slot)이 true인 슬롯을 비우고 순서대로 다시 채운다 (mutates plan)
function fill(plan, ctx, rng, shouldRefill) {
  const targets = [];
  for (const p of positions(plan)) {
    const s = slotAt(plan, p);
    if (shouldRefill(s)) {
      s.recipeId = null;
      s.pinned = false;
      targets.push(p);
    }
  }
  if (!targets.length) return plan;
  const warnings = new Set();
  for (const p of targets) {
    const s = slotAt(plan, p);
    const res = pick(plan, p, ctx, rng);
    s.recipeId = res.recipeId;
    if (res.relaxed) warnings.add(RELAX_WARNING);
    if (!res.recipeId) warnings.add(`${MEAL_LABEL[p.meal]} ${TYPE_LABEL[s.type]}에 맞는 메뉴가 없어요`);
  }
  plan.warnings = [...warnings];
  return plan;
}

// 남은 null 슬롯 기준으로 "없어요" 경고를 다시 계산한다 (RELAX_WARNING은 유지)
function syncMissingWarnings(plan) {
  const missing = new Set();
  for (const p of positions(plan)) {
    const s = slotAt(plan, p);
    if (!s.recipeId) missing.add(`${MEAL_LABEL[p.meal]} ${TYPE_LABEL[s.type]}에 맞는 메뉴가 없어요`);
  }
  plan.warnings = [...plan.warnings.filter((w) => !w.endsWith('에 맞는 메뉴가 없어요')), ...missing];
  return plan;
}

export function generateWeek({ existingPlan = null, rng = Math.random, ...data }) {
  const ctx = makeCtx(data);
  const plan = emptyPlan();
  if (existingPlan) {
    for (const p of positions(plan)) {
      const old = existingPlan.days?.[p.dayIndex]?.[p.meal]?.[p.slotIndex];
      if (old?.pinned && old.recipeId && ctx.recipeById.has(old.recipeId)) {
        Object.assign(slotAt(plan, p), { recipeId: old.recipeId, pinned: true });
      }
    }
  }
  return fill(plan, ctx, rng, (s) => !s.pinned);
}

export function refreshPlan({ plan, rng = Math.random, ...data }) {
  const ctx = makeCtx(data);
  return fill(clone(plan), ctx, rng, (s) => {
    const r = s.recipeId && ctx.recipeById.get(s.recipeId);
    if (!r) return true;
    if (s.pinned) return false;
    return !isAllowed(r, ctx);
  });
}

export function rerollSlot({ plan, dayIndex, meal, slotIndex, rng = Math.random, ...data }) {
  const ctx = makeCtx(data);
  const next = clone(plan);
  const pos = { dayIndex, meal, slotIndex };
  const cur = slotAt(next, pos);
  const res = pick(next, pos, ctx, rng, cur.recipeId ? [cur.recipeId] : []);
  if (res.recipeId) {
    cur.recipeId = res.recipeId;
    cur.pinned = false;
    syncMissingWarnings(next);
  }
  return next;
}

export function candidatesFor({ plan, dayIndex, meal, slotIndex, ...data }) {
  const ctx = makeCtx(data);
  const pos = { dayIndex, meal, slotIndex };
  const rest = others(plan, pos);
  return baseCandidates(ctx, meal, slotAt(plan, pos).type)
    .map((recipe) => {
      const a = analyze(recipe, pos, rest, ctx);
      const notes = [];
      if (a.sameMeal) notes.push('이 끼니에 이미 있어요');
      if (a.sameDay) notes.push('오늘 다른 끼니에 있어요');
      if (a.uses) notes.push(`이번 주 ${a.uses}회 사용`);
      if (a.yesterday) notes.push('어제도 나왔어요');
      if (a.tomorrow) notes.push('내일도 나와요');
      if (a.proteinClash) notes.push(`오늘 ${MEAL_LABEL[a.proteinClash]}에도 ${PROTEIN_LABEL[recipe.protein]}`);
      return { recipe, notes };
    })
    .sort((x, y) => x.recipe.name.localeCompare(y.recipe.name, 'ko'));
}

export function setSlot({ plan, dayIndex, meal, slotIndex, recipeId }) {
  const next = clone(plan);
  Object.assign(next.days[dayIndex][meal][slotIndex], { recipeId, pinned: true });
  return syncMissingWarnings(next);
}

export function unpinSlot({ plan, dayIndex, meal, slotIndex }) {
  const next = clone(plan);
  next.days[dayIndex][meal][slotIndex].pinned = false;
  return next;
}
