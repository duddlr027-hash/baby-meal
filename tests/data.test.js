import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INGREDIENTS } from '../js/data/ingredients.js';
import { RECIPES } from '../js/data/recipes.js';

const SECTIONS = ['veg', 'meat', 'fish', 'tofu_dairy', 'grain'];
const TYPES = ['bowl', 'rice', 'soup', 'side'];
const PROTEINS = ['beef', 'chicken', 'pork', 'fish', 'tofu', 'egg', 'none'];
const METHODS = ['밥', '죽', '볶음', '덮밥', '면', '주먹밥', '리조또', '국', '찜', '조림', '무침', '구이'];
const ing = new Map(INGREDIENTS.map((i) => [i.id, i]));

test('재료 id 중복 없음, 필드 유효', () => {
  assert.equal(ing.size, INGREDIENTS.length);
  for (const i of INGREDIENTS) {
    assert.ok(i.name && i.kurly, i.id);
    assert.ok(SECTIONS.includes(i.section), i.id);
    assert.equal(typeof i.unit, 'string', i.id);
    assert.ok(i.buyStep > 0, i.id);
    assert.equal(typeof i.pantry, 'boolean', i.id);
  }
});

test('모든 재료는 최소 한 레시피에서 쓰인다', () => {
  const used = new Set(RECIPES.flatMap((r) => r.items.map((it) => it.id)));
  for (const i of INGREDIENTS) assert.ok(used.has(i.id), `안 쓰는 재료: ${i.id}`);
});

test('레시피 필드 유효', () => {
  assert.equal(new Set(RECIPES.map((r) => r.id)).size, RECIPES.length);
  for (const r of RECIPES) {
    assert.ok(r.name, r.id);
    assert.ok(TYPES.includes(r.type), r.id);
    if (r.type === 'bowl') assert.ok(r.meals.length > 0 && r.meals.every((m) => m === 'breakfast' || m === 'dinner'), r.id);
    else assert.deepEqual(r.meals, ['dinner'], r.id);
    assert.ok(METHODS.includes(r.method), r.id);
    if (r.type === 'rice') assert.equal(r.method, '밥', r.id);
    if (r.type === 'soup') assert.equal(r.method, '국', r.id);
    assert.ok(PROTEINS.includes(r.protein), r.id);
  }
});

test('쉬운 기준: 15분, 재료 3개, 2~3줄, 금지 요리', () => {
  for (const r of RECIPES) {
    assert.ok(Number.isInteger(r.minutes) && r.minutes >= 1 && r.minutes <= 15, `${r.id} ${r.minutes}분`);
    assert.ok(r.steps.length >= 2 && r.steps.length <= 3, `${r.id} steps ${r.steps.length}`);
    assert.ok(r.steps.every((s) => typeof s === 'string' && s.length > 0), r.id);
    const core = r.items.filter((it) => !ing.get(it.id)?.pantry);
    assert.ok(core.length <= 3, `${r.id} 재료 ${core.length}개`);
    assert.ok(!/전$|완자|장조림|동그랑땡/.test(r.name), `${r.id} 금지 요리`);
  }
});

test('재료: 사전에 있고, 중복 없고, 비-상비는 qty > 0', () => {
  for (const r of RECIPES) {
    assert.equal(new Set(r.items.map((i) => i.id)).size, r.items.length, `${r.id} 재료 중복`);
    for (const it of r.items) {
      const i = ing.get(it.id);
      assert.ok(i, `${r.id}: 알 수 없는 재료 ${it.id}`);
      if (!i.pantry) assert.ok(it.qty > 0, `${r.id}: ${it.id} qty 필요`);
    }
  }
});

test('메인 재료: everyday는 0개, 나머지 1~2개, items 안, 상비는 된장만', () => {
  for (const r of RECIPES) {
    if (r.everyday) { assert.deepEqual(r.main, [], r.id); continue; }
    assert.ok(r.main.length >= 1 && r.main.length <= 2, `${r.id} main ${r.main.length}`);
    for (const k of r.main) {
      assert.ok(r.items.some((it) => it.id === k), `${r.id}: main ${k}가 items에 없음`);
      if (ing.get(k).pantry) assert.equal(k, 'doenjang', `${r.id}: 상비 재료 ${k}는 메인 불가`);
    }
  }
});

test('everyday는 rice 중 정확히 하나', () => {
  const ev = RECIPES.filter((r) => r.everyday);
  assert.equal(ev.length, 1);
  assert.equal(ev[0].type, 'rice');
});

test('종류별 최소 개수', () => {
  const count = (f) => RECIPES.filter(f).length;
  assert.ok(count((r) => r.type === 'bowl' && r.meals.includes('breakfast')) >= 8);
  assert.ok(count((r) => r.type === 'bowl' && r.meals.includes('dinner')) >= 6);
  assert.ok(count((r) => r.type === 'rice' && !r.everyday) >= 4);
  assert.ok(count((r) => r.type === 'soup') >= 10);
  assert.ok(count((r) => r.type === 'side') >= 12);
  assert.ok(count((r) => r.protein === 'beef') >= 6);
  assert.ok(count((r) => r.protein === 'fish') >= 5);
});
