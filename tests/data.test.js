import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INGREDIENTS } from '../js/data/ingredients.js';
import { RECIPES } from '../js/data/recipes.js';

const SECTIONS = ['veg', 'meat', 'fish', 'tofu_dairy', 'grain'];
const TYPES = ['main', 'side', 'soup'];
const MEALS = ['breakfast', 'dinner'];
const PROTEINS = ['beef', 'chicken', 'pork', 'fish', 'tofu', 'egg', 'none'];
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

test('레시피 id 중복 없음, 필드 유효', () => {
  assert.equal(new Set(RECIPES.map((r) => r.id)).size, RECIPES.length);
  for (const r of RECIPES) {
    assert.ok(r.name, r.id);
    assert.ok(TYPES.includes(r.type), r.id);
    assert.ok(r.meals.length > 0 && r.meals.every((m) => MEALS.includes(m)), r.id);
    assert.ok(PROTEINS.includes(r.protein), r.id);
    assert.ok(r.steps.length >= 2 && r.steps.length <= 4, r.id);
    assert.ok(r.steps.every((s) => typeof s === 'string' && s.length > 0), r.id);
  }
});

test('레시피 재료는 모두 사전에 있고, 비-pantry는 qty > 0', () => {
  for (const r of RECIPES) {
    assert.equal(new Set(r.items.map((i) => i.id)).size, r.items.length, `${r.id} 재료 중복`);
    for (const it of r.items) {
      const i = ing.get(it.id);
      assert.ok(i, `${r.id}: 알 수 없는 재료 ${it.id}`);
      if (!i.pantry) assert.ok(it.qty > 0, `${r.id}: ${it.id} qty 필요`);
    }
  }
});

test('종류별 최소 개수', () => {
  const count = (f) => RECIPES.filter(f).length;
  assert.ok(count((r) => r.type === 'main') >= 15);
  assert.ok(count((r) => r.type === 'side') >= 25);
  assert.ok(count((r) => r.type === 'soup') >= 10);
  assert.ok(count((r) => r.type === 'main' && r.meals.includes('breakfast')) >= 6);
  assert.ok(count((r) => r.type === 'side' && r.meals.includes('breakfast')) >= 6);
  assert.ok(count((r) => r.type === 'main' && r.meals.includes('dinner')) >= 7);
  assert.ok(count((r) => r.protein === 'beef') >= 6);
  assert.ok(count((r) => r.protein === 'fish') >= 4);
});
