import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateWeek, emptyPlan, makeRng, RELAX_WARNING, MEAL_STRUCTURE,
         refreshPlan, rerollSlot, candidatesFor, setSlot, unpinSlot } from '../js/planner.js';
import { INGREDIENTS } from '../js/data/ingredients.js';
import { RECIPES } from '../js/data/recipes.js';
import { ING, MINI } from './fixtures.js';

const FULL = { recipes: RECIPES, ingredients: INGREDIENTS };
const byId = new Map(RECIPES.map((r) => [r.id, r]));
const slots = (plan) => plan.days.flatMap((day, d) => ['breakfast', 'dinner'].flatMap((meal) => day[meal].map((s, i) => ({ ...s, d, meal, i }))));

test('emptyPlan은 7일, 끼니 구성대로', () => {
  const p = emptyPlan();
  assert.equal(p.days.length, 7);
  assert.deepEqual(p.days[0].breakfast.map((s) => s.type), MEAL_STRUCTURE.breakfast);
  assert.deepEqual(p.days[0].dinner.map((s) => s.type), ['main', 'side', 'side', 'soup']);
});

test('makeRng는 결정적', () => {
  const a = makeRng(42), b = makeRng(42);
  for (let i = 0; i < 5; i++) assert.equal(a(), b());
});

test('같은 시드면 같은 식단', () => {
  assert.deepEqual(generateWeek({ ...FULL, rng: makeRng(7) }), generateWeek({ ...FULL, rng: makeRng(7) }));
});

for (let seed = 1; seed <= 30; seed++) {
  test(`전체 데이터 규칙 준수 (seed ${seed})`, () => {
    const plan = generateWeek({ ...FULL, rng: makeRng(seed) });
    const all = slots(plan);
    assert.deepEqual(plan.warnings, []);
    for (const s of all) {
      const r = byId.get(s.recipeId);
      assert.ok(r, '빈 슬롯 없음');
      assert.equal(r.type, s.type);
      assert.ok(r.meals.includes(s.meal));
    }
    // 같은 레시피 주 2회 이하, 같은 날/전날/다음 날 중복 없음
    const uses = new Map();
    for (const s of all) uses.set(s.recipeId, [...(uses.get(s.recipeId) ?? []), s.d]);
    for (const [id, days] of uses) {
      assert.ok(days.length <= 2, `${id} ${days.length}회`);
      if (days.length === 2) assert.ok(Math.abs(days[0] - days[1]) >= 2, `${id} 근접 ${days}`);
    }
    // 같은 날 아침·저녁 main 단백질 겹치지 않음
    for (const day of plan.days) {
      const b = byId.get(day.breakfast[0].recipeId).protein;
      const dn = byId.get(day.dinner[0].recipeId).protein;
      if (b !== 'none') assert.notEqual(b, dn);
    }
    const count = (p) => all.filter((s) => byId.get(s.recipeId).protein === p).length;
    assert.ok(count('beef') >= 3, `소고기 ${count('beef')}`);
    assert.ok(count('fish') >= 2, `생선 ${count('fish')}`);
  });
}

test('제외 재료가 든 레시피는 나오지 않는다', () => {
  for (let seed = 1; seed <= 10; seed++) {
    const plan = generateWeek({ ...FULL, excluded: ['egg', 'shrimp'], rng: makeRng(seed) });
    for (const s of slots(plan)) {
      const r = byId.get(s.recipeId);
      assert.ok(!r.items.some((it) => it.id === 'egg' || it.id === 'shrimp'), r.id);
    }
  }
});

test('같은 끼니 안에서 중복 없음 (레시피 부족해도)', () => {
  const plan = generateWeek({ recipes: MINI, ingredients: ING, rng: makeRng(1) });
  for (const day of plan.days) {
    const ids = day.dinner.map((s) => s.recipeId).filter(Boolean);
    assert.equal(new Set(ids).size, ids.length);
  }
});

test('레시피가 부족하면 완화하고 경고 한 번', () => {
  const plan = generateWeek({ recipes: MINI, ingredients: ING, rng: makeRng(1) });
  assert.ok(plan.days.every((d) => d.dinner[0].recipeId === 'm-beef'));
  assert.equal(plan.warnings.filter((w) => w === RELAX_WARNING).length, 1);
});

test('후보가 없으면 null + 경고', () => {
  const plan = generateWeek({ recipes: MINI, ingredients: ING, excluded: ['egg'], rng: makeRng(1) });
  assert.ok(plan.days.every((d) => d.dinner[3].recipeId === null));
  assert.ok(plan.warnings.includes('저녁 국에 맞는 메뉴가 없어요'));
});

test('existingPlan의 📌 슬롯은 유지, 나머지는 새로', () => {
  const first = generateWeek({ ...FULL, rng: makeRng(3) });
  first.days[2].dinner[1] = { type: 'side', recipeId: 'spinach-namul', pinned: true };
  const next = generateWeek({ ...FULL, existingPlan: first, rng: makeRng(99) });
  assert.deepEqual(next.days[2].dinner[1], { type: 'side', recipeId: 'spinach-namul', pinned: true });
  assert.ok(slots(next).filter((s) => s.pinned).length === 1);
});

test('📌 레시피가 DB에서 사라졌으면 새로 채운다', () => {
  const first = emptyPlan();
  first.days[0].breakfast[0] = { type: 'main', recipeId: 'deleted-recipe', pinned: true };
  const next = generateWeek({ ...FULL, existingPlan: first, rng: makeRng(1) });
  assert.ok(byId.has(next.days[0].breakfast[0].recipeId));
  assert.equal(next.days[0].breakfast[0].pinned, false);
});

test('rerollSlot은 그 슬롯만 바꾸고 원본을 건드리지 않는다', () => {
  const plan = generateWeek({ ...FULL, rng: makeRng(5) });
  const before = JSON.stringify(plan);
  const next = rerollSlot({ ...FULL, plan, dayIndex: 3, meal: 'dinner', slotIndex: 1, rng: makeRng(1) });
  assert.equal(JSON.stringify(plan), before);
  assert.notEqual(next.days[3].dinner[1].recipeId, plan.days[3].dinner[1].recipeId);
  assert.equal(next.days[3].dinner[1].pinned, false);
  const strip = (p) => { const c = JSON.parse(JSON.stringify(p)); c.days[3].dinner[1] = null; return c; };
  assert.deepEqual(strip(next), strip(plan));
});

test('rerollSlot: 다른 후보가 없으면 그대로', () => {
  const plan = generateWeek({ recipes: MINI, ingredients: ING, rng: makeRng(1) });
  const next = rerollSlot({ recipes: MINI, ingredients: ING, plan, dayIndex: 0, meal: 'dinner', slotIndex: 0, rng: makeRng(2) });
  assert.equal(next.days[0].dinner[0].recipeId, 'm-beef');
});

test('setSlot은 고정, unpinSlot은 해제 (메뉴 유지)', () => {
  const plan = generateWeek({ ...FULL, rng: makeRng(5) });
  const set = setSlot({ plan, dayIndex: 0, meal: 'breakfast', slotIndex: 1, recipeId: 'spinach-namul' });
  assert.deepEqual(set.days[0].breakfast[1], { type: 'side', recipeId: 'spinach-namul', pinned: true });
  assert.equal(plan.days[0].breakfast[1].pinned, false);
  const un = unpinSlot({ plan: set, dayIndex: 0, meal: 'breakfast', slotIndex: 1 });
  assert.deepEqual(un.days[0].breakfast[1], { type: 'side', recipeId: 'spinach-namul', pinned: false });
});

test('refreshPlan: 제외 재료가 생기면 📌 아닌 해당 슬롯만 교체', () => {
  let plan = generateWeek({ ...FULL, rng: makeRng(11) });
  plan = setSlot({ plan, dayIndex: 0, meal: 'breakfast', slotIndex: 0, recipeId: 'egg-fried-rice' });
  const next = refreshPlan({ ...FULL, plan, excluded: ['egg'], rng: makeRng(2) });
  assert.equal(next.days[0].breakfast[0].recipeId, 'egg-fried-rice'); // 📌 유지
  for (const s of slots(next)) {
    if (s.d === 0 && s.meal === 'breakfast' && s.i === 0) continue;
    assert.ok(!byId.get(s.recipeId).items.some((it) => it.id === 'egg'), s.recipeId);
  }
  // 계란과 무관했던 슬롯은 그대로
  for (const s of slots(plan)) {
    const r = byId.get(s.recipeId);
    if (!r.items.some((it) => it.id === 'egg')) assert.equal(next.days[s.d][s.meal][s.i].recipeId, s.recipeId);
  }
});

test('refreshPlan: 바꿀 게 없으면 동일, 사라진 레시피는 채움', () => {
  const plan = generateWeek({ ...FULL, rng: makeRng(4) });
  assert.deepEqual(refreshPlan({ ...FULL, plan, rng: makeRng(1) }), plan);
  const broken = JSON.parse(JSON.stringify(plan));
  broken.days[1].dinner[3] = { type: 'soup', recipeId: 'deleted', pinned: true };
  const fixed = refreshPlan({ ...FULL, plan: broken, rng: makeRng(1) });
  assert.equal(byId.get(fixed.days[1].dinner[3].recipeId).type, 'soup');
});

test('candidatesFor: 하드 규칙만 적용, 참고 문구, 이름순', () => {
  const plan = emptyPlan();
  plan.days[0].breakfast[0] = { type: 'main', recipeId: 'egg-fried-rice', pinned: false };
  plan.days[1].dinner[0] = { type: 'main', recipeId: 'beef-zucchini-rice', pinned: false };
  plan.days[3].dinner[0] = { type: 'main', recipeId: 'beef-zucchini-rice', pinned: false };
  const list = candidatesFor({ ...FULL, plan, dayIndex: 2, meal: 'dinner', slotIndex: 0 });
  const names = list.map((c) => c.recipe.name);
  assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b, 'ko')));
  assert.ok(list.every((c) => c.recipe.type === 'main' && c.recipe.meals.includes('dinner')));
  const bz = list.find((c) => c.recipe.id === 'beef-zucchini-rice');
  assert.deepEqual(bz.notes, ['이번 주 2회 사용', '어제도 나왔어요', '내일도 나와요']);

  const b = candidatesFor({ ...FULL, plan, dayIndex: 0, meal: 'dinner', slotIndex: 0 });
  assert.deepEqual(b.find((c) => c.recipe.id === 'tomato-egg-rice'), undefined); // 아침 전용
  assert.ok(b.find((c) => c.recipe.id === 'egg-fried-rice').notes.includes('오늘 다른 끼니에 있어요'));

  const ex = candidatesFor({ ...FULL, plan, excluded: ['beef_mince'], dayIndex: 2, meal: 'dinner', slotIndex: 0 });
  assert.ok(!ex.some((c) => c.recipe.items.some((it) => it.id === 'beef_mince')));
});

test('candidatesFor: 같은 날 단백질 겹침 문구', () => {
  const plan = emptyPlan();
  plan.days[0].breakfast[0] = { type: 'main', recipeId: 'tomato-egg-rice', pinned: false };
  const list = candidatesFor({ ...FULL, plan, dayIndex: 0, meal: 'dinner', slotIndex: 0 });
  assert.ok(list.find((c) => c.recipe.id === 'egg-fried-rice').notes.includes('오늘 아침에도 계란'));
});

const NO_EGG = { recipes: MINI, ingredients: ING, excluded: ['egg'] };
const fillSoups = (plan, upTo) => {
  for (let d = 0; d < upTo; d++) plan = setSlot({ plan, dayIndex: d, meal: 'dinner', slotIndex: 3, recipeId: 'soup-egg' });
  return plan;
};

test('setSlot: 마지막 빈 슬롯을 채우면 "맞는 메뉴가 없어요" 경고가 사라진다', () => {
  let plan = generateWeek({ ...NO_EGG, rng: makeRng(1) });
  assert.ok(plan.warnings.includes('저녁 국에 맞는 메뉴가 없어요'));
  plan = fillSoups(plan, 6);
  assert.ok(plan.warnings.includes('저녁 국에 맞는 메뉴가 없어요'), '아직 1칸 비어 있음');
  plan = fillSoups(plan, 7);
  assert.ok(!plan.warnings.some((w) => w.includes('맞는 메뉴가 없어요')));
  assert.ok(plan.warnings.includes(RELAX_WARNING) === generateWeek({ ...NO_EGG, rng: makeRng(1) }).warnings.includes(RELAX_WARNING));
});

test('rerollSlot: 빈 슬롯이 채워지면 경고가 사라진다', () => {
  let plan = fillSoups(generateWeek({ ...NO_EGG, rng: makeRng(1) }), 6);
  const next = rerollSlot({ recipes: MINI, ingredients: ING, plan, dayIndex: 6, meal: 'dinner', slotIndex: 3, rng: makeRng(2) });
  assert.equal(next.days[6].dinner[3].recipeId, 'soup-egg');
  assert.ok(!next.warnings.some((w) => w.includes('맞는 메뉴가 없어요')));
  assert.ok(plan.warnings.includes('저녁 국에 맞는 메뉴가 없어요'), '원본은 그대로');
});
