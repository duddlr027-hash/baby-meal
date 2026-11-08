import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateWeek, refreshPlan, rerollSlot, candidatesFor, setSlot, unpinSlot, emptyPlan, makeRng,
  RELAX_WARNING, DINNER_FORMS, PLAN_VERSION,
} from '../js/planner.js';
import { ING2, V2 } from './fixtures.js';
import { INGREDIENTS } from '../js/data/ingredients.js';
import { RECIPES } from '../js/data/recipes.js';

const D2 = { recipes: V2, ingredients: ING2 };
const byId2 = new Map(V2.map((r) => [r.id, r]));
const slots = (plan) => plan.days.flatMap((day, d) => ['breakfast', 'dinner'].flatMap((meal) => day[meal].map((s, i) => ({ ...s, d, meal, i }))));
const mealsOf = (plan, byId) => plan.days.flatMap((day, d) => ['breakfast', 'dinner'].map((meal) => ({ d, meal, recipes: day[meal].map((s) => byId.get(s.recipeId)).filter(Boolean) })));
const clone = (p) => JSON.parse(JSON.stringify(p));

test('emptyPlan: 아침 bowl 1개, 저녁은 형태별, version 2', () => {
  const p = emptyPlan([1, 4]);
  assert.equal(p.version, PLAN_VERSION);
  assert.equal(PLAN_VERSION, 2);
  assert.equal(p.days.length, 7);
  assert.deepEqual(p.days[0].breakfast.map((s) => s.type), ['bowl']);
  assert.equal(p.days[0].dinnerForm, 'set');
  assert.deepEqual(p.days[0].dinner.map((s) => s.type), ['rice', 'soup', 'side']);
  assert.equal(p.days[1].dinnerForm, 'bowl');
  assert.deepEqual(p.days[4].dinner.map((s) => s.type), ['bowl', 'soup']);
  assert.deepEqual(DINNER_FORMS, { set: ['rice', 'soup', 'side'], bowl: ['bowl', 'soup'] });
});

test('같은 시드면 같은 식단', () => {
  assert.deepEqual(generateWeek({ ...D2, rng: makeRng(7) }), generateWeek({ ...D2, rng: makeRng(7) }));
});

for (let seed = 1; seed <= 20; seed++) {
  test(`형태·한 끼 규칙 (seed ${seed})`, () => {
    const plan = generateWeek({ ...D2, rng: makeRng(seed) });
    const bowlDays = plan.days.filter((d) => d.dinnerForm === 'bowl').length;
    assert.ok(bowlDays >= 2 && bowlDays <= 3, `bowl 저녁 ${bowlDays}`);
    for (const day of plan.days) assert.deepEqual(day.dinner.map((s) => s.type), DINNER_FORMS[day.dinnerForm]);
    for (const s of slots(plan)) {
      const r = byId2.get(s.recipeId);
      assert.ok(r, '빈 슬롯 없음');
      assert.equal(r.type, s.type);
      assert.ok(r.meals.includes(s.meal));
    }
    for (const m of mealsOf(plan, byId2)) {
      const keys = m.recipes.flatMap((r) => r.main);
      assert.equal(new Set(keys).size, keys.length, `메인 재료 겹침 day${m.d} ${m.meal}`);
      const methods = m.recipes.map((r) => r.method);
      assert.equal(new Set(methods).size, methods.length, `조리법 겹침 day${m.d} ${m.meal}`);
    }
  });
}

test('everyday 밥은 반복 제한이 없고, 영양밥은 주 2회·비연속', () => {
  let maxPlain = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const plan = generateWeek({ ...D2, rng: makeRng(seed) });
    const riceDays = (id) => plan.days.flatMap((day, d) => (day.dinner.some((s) => s.recipeId === id) ? [d] : []));
    const zuc = riceDays('r-zuc');
    assert.ok(zuc.length <= 2);
    if (zuc.length === 2) assert.ok(zuc[1] - zuc[0] >= 2);
    maxPlain = Math.max(maxPlain, riceDays('r-plain').length);
  }
  assert.ok(maxPlain >= 3, `흰 진밥 최대 ${maxPlain}회`);
});

test('📌 저녁 메뉴가 있는 날은 형태를 유지', () => {
  const base = generateWeek({ ...D2, rng: makeRng(3) });
  const forced = clone(base);
  forced.days[5] = { dinnerForm: 'bowl', breakfast: base.days[5].breakfast,
    dinner: [{ type: 'bowl', recipeId: 'b-beef', pinned: true }, { type: 'soup', recipeId: 's-tofu', pinned: false }] };
  forced.days[2] = { dinnerForm: 'set', breakfast: base.days[2].breakfast,
    dinner: [{ type: 'rice', recipeId: 'r-plain', pinned: false }, { type: 'soup', recipeId: 's-egg', pinned: false }, { type: 'side', recipeId: 'd-cod', pinned: true }] };
  for (let seed = 1; seed <= 10; seed++) {
    const next = generateWeek({ ...D2, existingPlan: forced, rng: makeRng(seed) });
    assert.equal(next.days[5].dinnerForm, 'bowl');
    assert.deepEqual(next.days[5].dinner[0], { type: 'bowl', recipeId: 'b-beef', pinned: true });
    assert.equal(next.days[2].dinnerForm, 'set');
    assert.deepEqual(next.days[2].dinner[2], { type: 'side', recipeId: 'd-cod', pinned: true });
    const bowlDays = next.days.filter((d) => d.dinnerForm === 'bowl').length;
    assert.ok(bowlDays >= 2 && bowlDays <= 3);
  }
});

test('v1(버전 없는) 계획은 refreshPlan에서 새로 생성', () => {
  const old = { days: [{ breakfast: [{ type: 'main', recipeId: 'x', pinned: true }], dinner: [] }], warnings: [] };
  const fresh = refreshPlan({ ...D2, plan: old, rng: makeRng(1) });
  assert.equal(fresh.version, PLAN_VERSION);
  assert.equal(fresh.days.length, 7);
  assert.ok(slots(fresh).every((s) => !s.pinned && byId2.has(s.recipeId)));
});

test('후보가 부족하면 완화 + 경고 한 번', () => {
  const plan = generateWeek({ ...D2, excluded: ['tofu', 'spinach'], rng: makeRng(1) });
  assert.ok(plan.days.every((d) => d.dinner.find((s) => s.type === 'soup').recipeId === 's-egg'));
  assert.equal(plan.warnings.filter((w) => w === RELAX_WARNING).length, 1);
});

test('후보가 없으면 null + 경고, 채우면 경고가 사라진다', () => {
  let plan = generateWeek({ ...D2, excluded: ['egg', 'tofu', 'spinach'], rng: makeRng(1) });
  assert.ok(plan.days.every((d) => d.dinner.find((s) => s.type === 'soup').recipeId === null));
  assert.ok(plan.warnings.includes('저녁 국에 맞는 메뉴가 없어요'));
  for (let d = 0; d < 7; d++) plan = setSlot({ plan, dayIndex: d, meal: 'dinner', slotIndex: 1, recipeId: 's-egg' });
  assert.ok(!plan.warnings.includes('저녁 국에 맞는 메뉴가 없어요'));
});

test('refreshPlan: 제외 재료가 생기면 📌 아닌 해당 슬롯만 교체', () => {
  let plan = generateWeek({ ...D2, rng: makeRng(11) });
  plan = setSlot({ plan, dayIndex: 0, meal: 'breakfast', slotIndex: 0, recipeId: 'b-egg' });
  const next = refreshPlan({ ...D2, plan, excluded: ['egg'], rng: makeRng(2) });
  assert.deepEqual(next.days[0].breakfast[0], { type: 'bowl', recipeId: 'b-egg', pinned: true });
  for (const s of slots(next)) {
    if (s.d === 0 && s.meal === 'breakfast') continue;
    const r = byId2.get(s.recipeId);
    if (r) assert.ok(!r.items.some((it) => it.id === 'egg'), r.id);
  }
  for (const s of slots(plan)) {
    const r = byId2.get(s.recipeId);
    if (r && !r.items.some((it) => it.id === 'egg')) assert.equal(next.days[s.d][s.meal][s.i].recipeId, s.recipeId);
  }
  assert.equal(next.version, PLAN_VERSION);
});

test('rerollSlot은 그 슬롯만 바꾸고 원본을 건드리지 않는다', () => {
  const plan = generateWeek({ ...D2, rng: makeRng(5) });
  const before = JSON.stringify(plan);
  const next = rerollSlot({ ...D2, plan, dayIndex: 3, meal: 'dinner', slotIndex: 1, rng: makeRng(1) });
  assert.equal(JSON.stringify(plan), before);
  assert.notEqual(next.days[3].dinner[1].recipeId, plan.days[3].dinner[1].recipeId);
  assert.equal(next.days[3].dinner[1].pinned, false);
  const strip = (p) => { const c = clone(p); c.days[3].dinner[1] = null; c.warnings = []; return c; };
  assert.deepEqual(strip(next), strip(plan));
});

test('setSlot은 고정, unpinSlot은 해제', () => {
  const plan = generateWeek({ ...D2, rng: makeRng(5) });
  const set = setSlot({ plan, dayIndex: 0, meal: 'breakfast', slotIndex: 0, recipeId: 'b-oat' });
  assert.deepEqual(set.days[0].breakfast[0], { type: 'bowl', recipeId: 'b-oat', pinned: true });
  const un = unpinSlot({ plan: set, dayIndex: 0, meal: 'breakfast', slotIndex: 0 });
  assert.deepEqual(un.days[0].breakfast[0], { type: 'bowl', recipeId: 'b-oat', pinned: false });
});

test('candidatesFor: 메인 재료·조리법 겹침 문구', () => {
  const p = emptyPlan([]);
  p.days[0].dinner[0] = { type: 'rice', recipeId: 'r-zuc', pinned: false };
  p.days[0].dinner[1] = { type: 'soup', recipeId: 's-egg', pinned: false };
  const list = candidatesFor({ ...D2, plan: p, dayIndex: 0, meal: 'dinner', slotIndex: 2 });
  const names = list.map((c) => c.recipe.name);
  assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b, 'ko')));
  assert.ok(list.every((c) => c.recipe.type === 'side'));
  const notes = (id) => list.find((c) => c.recipe.id === id).notes;
  assert.ok(notes('d-egg').includes('메인 재료 겹침: 계란'));
  assert.ok(notes('d-zuc').includes('메인 재료 겹침: 애호박'));
  assert.ok(notes('d-brothy').includes('조리법 겹침: 국'));
  assert.deepEqual(notes('d-cod'), []);
});

test('candidatesFor: 주간 반복 문구', () => {
  const p = emptyPlan([]);
  p.days[1].dinner[2] = { type: 'side', recipeId: 'd-cod', pinned: false };
  p.days[3].dinner[2] = { type: 'side', recipeId: 'd-cod', pinned: false };
  const list = candidatesFor({ ...D2, plan: p, dayIndex: 2, meal: 'dinner', slotIndex: 2 });
  assert.deepEqual(list.find((c) => c.recipe.id === 'd-cod').notes, ['이번 주 2회 사용', '어제도 나왔어요', '내일도 나와요']);
});

const FULL = { recipes: RECIPES, ingredients: INGREDIENTS };
const byIdF = new Map(RECIPES.map((r) => [r.id, r]));

for (let seed = 1; seed <= 30; seed++) {
  test(`전체 데이터 규칙 준수 (seed ${seed})`, () => {
    const plan = generateWeek({ ...FULL, rng: makeRng(seed) });
    assert.deepEqual(plan.warnings, []);
    const bowlDays = plan.days.filter((d) => d.dinnerForm === 'bowl').length;
    assert.ok(bowlDays >= 2 && bowlDays <= 3);
    const all = slots(plan);
    for (const s of all) {
      const r = byIdF.get(s.recipeId);
      assert.ok(r, '빈 슬롯 없음');
      assert.equal(r.type, s.type);
      assert.ok(r.meals.includes(s.meal));
    }
    for (const m of mealsOf(plan, byIdF)) {
      const keys = m.recipes.flatMap((r) => r.main);
      assert.equal(new Set(keys).size, keys.length, `메인 재료 겹침 day${m.d} ${m.meal}`);
      const methods = m.recipes.map((r) => r.method);
      assert.equal(new Set(methods).size, methods.length, `조리법 겹침 day${m.d} ${m.meal}`);
    }
    const uses = new Map();
    for (const s of all) if (!byIdF.get(s.recipeId).everyday) uses.set(s.recipeId, [...(uses.get(s.recipeId) ?? []), s.d]);
    for (const [id, days] of uses) {
      assert.ok(days.length <= 2, `${id} ${days.length}회`);
      if (days.length === 2) assert.ok(Math.abs(days[0] - days[1]) >= 2, `${id} 근접 ${days}`);
    }
    const count = (p) => all.filter((s) => byIdF.get(s.recipeId).protein === p).length;
    assert.ok(count('beef') >= 3, `소고기 ${count('beef')}`);
    assert.ok(count('fish') >= 2, `생선 ${count('fish')}`);
  });
}

test('전체 데이터: 제외 재료가 든 레시피는 나오지 않는다', () => {
  for (let seed = 1; seed <= 10; seed++) {
    const plan = generateWeek({ ...FULL, excluded: ['egg', 'shrimp'], rng: makeRng(seed) });
    for (const s of slots(plan)) {
      const r = byIdF.get(s.recipeId);
      if (r) assert.ok(!r.items.some((it) => it.id === 'egg' || it.id === 'shrimp'), r.id);
    }
  }
});

// v2 최종 리뷰: 같은 단백질 / 같은 날 같은 조리법
const R2x = (id, type, meals, method, protein, main, items) =>
  ({ id, name: id, type, meals, method, protein, main, minutes: 10, items, steps: ['a', 'b'] });
const BEEFY = [
  ...V2.filter((r) => ['b-egg', 'b-oat', 'r-plain', 's-spin', 'd-zuc'].includes(r.id)),
  R2x('xs-beef', 'soup', ['dinner'], '국', 'beef', ['beef_mince'], [{ id: 'beef_mince', qty: 20 }]),
  R2x('xd-beef', 'side', ['dinner'], '구이', 'beef', ['carrot'], [{ id: 'carrot', qty: 0.2 }, { id: 'beef_mince', qty: 20 }]),
];

test('candidatesFor: 재료가 달라도 같은 단백질이면 메인 재료 겹침', () => {
  const p = emptyPlan([]);
  p.days[0].dinner[1] = { type: 'soup', recipeId: 'xs-beef', pinned: false };
  const list = candidatesFor({ recipes: BEEFY, ingredients: ING2, plan: p, dayIndex: 0, meal: 'dinner', slotIndex: 2 });
  assert.deepEqual(list.find((c) => c.recipe.id === 'xd-beef').notes, ['메인 재료 겹침: 소고기']);
  assert.deepEqual(list.find((c) => c.recipe.id === 'd-zuc').notes, []);
});

test('같은 끼니에 같은 단백질 두 개가 나오지 않는다 (재료가 달라도)', () => {
  for (let seed = 1; seed <= 30; seed++) {
    const plan = generateWeek({ recipes: BEEFY, ingredients: ING2, rng: makeRng(seed) });
    const byB = new Map(BEEFY.map((r) => [r.id, r]));
    for (const m of mealsOf(plan, byB)) {
      const beef = m.recipes.filter((r) => r.protein === 'beef');
      assert.ok(beef.length <= 1, `seed ${seed} day${m.d} ${m.meal} 소고기 ${beef.length}`);
    }
  }
});

test('candidatesFor: 같은 날 다른 끼니의 같은 조리법 문구', () => {
  const p = emptyPlan([]);
  p.days[0].breakfast[0] = { type: 'bowl', recipeId: 'b-egg', pinned: false };
  const list = candidatesFor({ ...D2, plan: p, dayIndex: 0, meal: 'dinner', slotIndex: 2 });
  assert.deepEqual(list.find((c) => c.recipe.id === 'd-zuc').notes, ['오늘 아침에도 볶음']);
  assert.deepEqual(list.find((c) => c.recipe.id === 'd-cod').notes, []);
});

for (let seed = 1; seed <= 30; seed++) {
  test(`전체 데이터: 한 끼 단백질·같은 날 조리법 (seed ${seed})`, () => {
    const plan = generateWeek({ ...FULL, rng: makeRng(seed) });
    assert.deepEqual(plan.warnings, []);
    const ms = mealsOf(plan, byIdF);
    for (const m of ms) {
      const pr = m.recipes.map((r) => r.protein).filter((x) => x !== 'none');
      assert.equal(new Set(pr).size, pr.length, `단백질 겹침 day${m.d} ${m.meal}`);
    }
    for (let d = 0; d < 7; d++) {
      const [b, n] = ['breakfast', 'dinner'].map((meal) => new Set(ms.find((m) => m.d === d && m.meal === meal).recipes.map((r) => r.method)));
      for (const x of b) assert.ok(!n.has(x), `같은 날 조리법 day${d} ${x}`);
    }
  });
}
