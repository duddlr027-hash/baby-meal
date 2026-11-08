export const DAYS = 7;
export const MEALS = ['breakfast', 'dinner'];
export const BREAKFAST = ['bowl'];
export const DINNER_FORMS = { set: ['rice', 'soup', 'side'], bowl: ['bowl', 'soup'] };
export const BOWL_DINNERS_MIN = 2;
export const BOWL_DINNERS_MAX = 3;
export const MEAL_LABEL = { breakfast: '아침', dinner: '저녁' };
export const TYPE_LABEL = { bowl: '한 그릇', rice: '밥', soup: '국', side: '반찬' };
export const PROTEIN_LABEL = { beef: '소고기', chicken: '닭고기', pork: '돼지고기', fish: '생선', tofu: '두부', egg: '계란' };
export const TARGETS = { beef: 3, fish: 2 };
export const RELAX_WARNING = '제외 재료가 많아 일부 메뉴가 반복되거나 겹쳐요';
export const PLAN_VERSION = 2;
const MAX_WEEKLY_USES = 2;
const EVERYDAY_WEIGHT = 4;

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

const slotsFor = (types) => types.map((type) => ({ type, recipeId: null, pinned: false }));

export function emptyPlan(bowlDays = []) {
  const bowl = new Set(bowlDays);
  return {
    version: PLAN_VERSION,
    days: Array.from({ length: DAYS }, (_, d) => {
      const dinnerForm = bowl.has(d) ? 'bowl' : 'set';
      return { dinnerForm, breakfast: slotsFor(BREAKFAST), dinner: slotsFor(DINNER_FORMS[dinnerForm]) };
    }),
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

// 메인 재료 키: main 재료 + (단백질이 있으면) '@단백질'
const keysOf = (r) => (r.protein === 'none' ? r.main : [...r.main, `@${r.protein}`]);

function analyze(recipe, pos, rest, ctx) {
  const same = rest.filter((o) => o.recipeId === recipe.id);
  const otherMeal = pos.meal === 'breakfast' ? 'dinner' : 'breakfast';
  const mates = rest
    .filter((o) => o.dayIndex === pos.dayIndex && o.meal === pos.meal)
    .map((o) => ctx.recipeById.get(o.recipeId))
    .filter(Boolean);
  const keyClash = keysOf(recipe).filter((k) => mates.some((m) => keysOf(m).includes(k)));
  const methodClash = mates.some((m) => m.method === recipe.method) ? recipe.method : null;
  let proteinClash = null;
  if (recipe.protein !== 'none') {
    const clash = rest.some((o) => o.dayIndex === pos.dayIndex && o.meal === otherMeal
      && ctx.recipeById.get(o.recipeId)?.protein === recipe.protein);
    if (clash) proteinClash = otherMeal;
  }
  const sameDayMethod = rest.some((o) => o.dayIndex === pos.dayIndex && o.meal === otherMeal
    && ctx.recipeById.get(o.recipeId)?.method === recipe.method);
  return {
    uses: same.length,
    sameMeal: same.some((o) => o.dayIndex === pos.dayIndex && o.meal === pos.meal),
    sameDay: same.some((o) => o.dayIndex === pos.dayIndex && o.meal !== pos.meal),
    yesterday: same.some((o) => o.dayIndex === pos.dayIndex - 1),
    tomorrow: same.some((o) => o.dayIndex === pos.dayIndex + 1),
    proteinClash,
    sameDayMethod: sameDayMethod ? otherMeal : null,
    keyClash,
    methodClash,
  };
}

function weightOf(recipe, rest, ctx) {
  let w = recipe.everyday ? EVERYDAY_WEIGHT : 1;
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

const weeklyOk = (c) => c.r.everyday || (c.a.uses < MAX_WEEKLY_USES && !c.a.sameDay && !c.a.yesterday && !c.a.tomorrow);
const mealOk = (c) => c.a.keyClash.length === 0 && !c.a.methodClash;
// 완화 순서: 단백질·같은 날 조리법 겹침 → 주간 반복 → 한 끼 규칙
const TIERS = [
  (c) => mealOk(c) && weeklyOk(c) && !c.a.proteinClash && !c.a.sameDayMethod,
  (c) => mealOk(c) && weeklyOk(c),
  (c) => mealOk(c),
  () => true,
];

function pick(plan, pos, ctx, rng, excludeIds = []) {
  const type = slotAt(plan, pos).type;
  const rest = others(plan, pos);
  const cands = baseCandidates(ctx, pos.meal, type)
    .filter((r) => !excludeIds.includes(r.id))
    .map((r) => ({ r, a: analyze(r, pos, rest, ctx) }))
    .filter((c) => !c.a.sameMeal);
  if (!cands.length) return { recipeId: null, relaxed: false };

  const tier = TIERS.findIndex((f) => cands.some(f));
  const pool = cands.filter(TIERS[tier]);
  const relaxed = tier > 0;

  const weights = pool.map((c) => weightOf(c.r, rest, ctx));
  let x = rng() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) {
    x -= weights[i];
    if (x < 0) return { recipeId: pool[i].r.id, relaxed };
  }
  return { recipeId: pool[pool.length - 1].r.id, relaxed };
}

const missingText = (meal, type) => `${MEAL_LABEL[meal]} ${TYPE_LABEL[type]}에 맞는 메뉴가 없어요`;

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
    if (!res.recipeId) warnings.add(missingText(p.meal, s.type));
  }
  plan.warnings = [...warnings];
  return plan;
}

// 남은 null 슬롯 기준으로 "없어요" 경고를 다시 계산한다 (RELAX_WARNING은 유지)
function syncMissingWarnings(plan) {
  const missing = new Set();
  for (const p of positions(plan)) {
    const s = slotAt(plan, p);
    if (!s.recipeId) missing.add(missingText(p.meal, s.type));
  }
  plan.warnings = [...plan.warnings.filter((w) => !w.endsWith('에 맞는 메뉴가 없어요')), ...missing];
  return plan;
}

const isV2 = (plan) => plan?.version === PLAN_VERSION;

// 저녁 한 그릇 날짜: 📌 있는 날의 형태는 유지, 나머지는 무작위로 2~3일
function chooseBowlDays(existingPlan, ctx, rng) {
  const forcedBowl = [];
  const forcedSet = new Set();
  if (isV2(existingPlan)) {
    existingPlan.days.forEach((day, d) => {
      const hasPin = day.dinner.some((s) => s.pinned && s.recipeId && ctx.recipeById.has(s.recipeId));
      if (!hasPin) return;
      if (day.dinnerForm === 'bowl') forcedBowl.push(d);
      else forcedSet.add(d);
    });
  }
  const target = BOWL_DINNERS_MIN + Math.floor(rng() * (BOWL_DINNERS_MAX - BOWL_DINNERS_MIN + 1));
  const free = [...Array(DAYS).keys()].filter((d) => !forcedBowl.includes(d) && !forcedSet.has(d));
  const days = [...forcedBowl];
  while (days.length < target && free.length) days.push(free.splice(Math.floor(rng() * free.length), 1)[0]);
  return days;
}

export function generateWeek({ existingPlan = null, rng = Math.random, ...data }) {
  const ctx = makeCtx(data);
  const plan = emptyPlan(chooseBowlDays(existingPlan, ctx, rng));
  if (isV2(existingPlan)) {
    for (const p of positions(plan)) {
      const oldDay = existingPlan.days?.[p.dayIndex];
      if (!oldDay) continue;
      if (p.meal === 'dinner' && oldDay.dinnerForm !== plan.days[p.dayIndex].dinnerForm) continue;
      const old = oldDay[p.meal]?.[p.slotIndex];
      if (old?.pinned && old.recipeId && ctx.recipeById.has(old.recipeId)) {
        Object.assign(slotAt(plan, p), { recipeId: old.recipeId, pinned: true });
      }
    }
  }
  return fill(plan, ctx, rng, (s) => !s.pinned);
}

export function refreshPlan({ plan, rng = Math.random, ...data }) {
  if (!isV2(plan)) return generateWeek({ ...data, rng });
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
  const keyName = (k) => (k.startsWith('@') ? PROTEIN_LABEL[k.slice(1)] : ctx.ingById.get(k)?.name ?? k);
  return baseCandidates(ctx, meal, slotAt(plan, pos).type)
    .map((recipe) => {
      const a = analyze(recipe, pos, rest, ctx);
      const notes = [];
      if (a.sameMeal) notes.push('이 끼니에 이미 있어요');
      if (a.keyClash.length) notes.push(`메인 재료 겹침: ${[...new Set(a.keyClash.map(keyName))].join(', ')}`);
      if (a.methodClash) notes.push(`조리법 겹침: ${a.methodClash}`);
      if (!recipe.everyday) {
        if (a.sameDay) notes.push('오늘 다른 끼니에 있어요');
        if (a.uses) notes.push(`이번 주 ${a.uses}회 사용`);
        if (a.yesterday) notes.push('어제도 나왔어요');
        if (a.tomorrow) notes.push('내일도 나와요');
      }
      if (a.proteinClash) notes.push(`오늘 ${MEAL_LABEL[a.proteinClash]}에도 ${PROTEIN_LABEL[recipe.protein]}`);
      if (a.sameDayMethod) notes.push(`오늘 ${MEAL_LABEL[a.sameDayMethod]}에도 ${recipe.method}`);
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
