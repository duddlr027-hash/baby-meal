import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildShoppingList, formatAmount, kurlyUrl, SECTIONS } from '../js/shopping.js';
import { ING, MINI, planOf } from './fixtures.js';

const build = (ids) => buildShoppingList({ plan: planOf(ids), recipes: MINI, ingredients: ING });
const find = (list, id) => list.sections.flatMap((s) => s.items).find((i) => i.id === id);

test('합산 후 구매 단위로 올림', () => {
  const list = build(['m-beef', 'm-beef', 'm-beef', 'm-beef', 'm-beef']);
  assert.equal(find(list, 'beef_mince').qtyText, '200g'); // 150 → 200
  assert.equal(find(list, 'zucchini').qtyText, '2개');    // 1.25 → 2
});

test('정확히 떨어지면 올리지 않음 (부동소수 오차 무시)', () => {
  const list = build(['m-beef', 'm-beef', 'm-beef', 'm-beef']);
  assert.equal(find(list, 'zucchini').qtyText, '1개'); // 0.25×4
  const cab = build(Array(5).fill('s-cabbage'));
  assert.equal(find(cab, 'cabbage').qtyText, '0.5통'); // 0.1×5
});

test('여러 레시피의 같은 재료를 합친다', () => {
  const list = build(['m-egg', 'soup-egg']);
  assert.equal(find(list, 'egg').qtyText, '10개'); // 1.5 → 10
});

test('pantry는 따로, 중복 없이', () => {
  const list = build(['m-beef', 'm-egg', 's-tofu']);
  assert.deepEqual(list.pantry.map((p) => p.id).sort(), ['rice', 'soy']);
  assert.equal(find(list, 'rice'), undefined);
});

test('코너 순서를 지키고 빈 코너는 뺀다', () => {
  const list = build(['m-beef', 's-cod', 's-tofu']);
  assert.deepEqual(list.sections.map((s) => s.id), ['veg', 'meat', 'fish', 'tofu_dairy']);
  assert.equal(list.sections[0].label, '채소·과일');
  assert.equal(SECTIONS.length, 5);
});

test('null 슬롯과 알 수 없는 레시피는 무시', () => {
  const plan = planOf(['m-beef', 'gone']);
  plan.days[1].dinner = [{ type: 'soup', recipeId: null, pinned: false }];
  const list = buildShoppingList({ plan, recipes: MINI, ingredients: ING });
  assert.equal(find(list, 'beef_mince').qtyText, '100g');
});

test('컬리 링크는 검색어를 인코딩', () => {
  assert.equal(kurlyUrl(ING[0]), 'https://www.kurly.com/search?sword=' + encodeURIComponent('유기농 애호박'));
  const list = build(['m-beef']);
  assert.equal(find(list, 'zucchini').kurlyUrl, kurlyUrl(ING[0]));
});

test('formatAmount', () => {
  assert.equal(formatAmount(30, 'g'), '30g');
  assert.equal(formatAmount(100, 'ml'), '100ml');
  assert.equal(formatAmount(0.25, '개'), '1/4개');
  assert.equal(formatAmount(0.5, '모'), '1/2모');
  assert.equal(formatAmount(0.2, '개'), '1/5개');
  assert.equal(formatAmount(0.3, '개'), '1/3개');
  assert.equal(formatAmount(0.1, '봉'), '조금');
  assert.equal(formatAmount(0.05, '봉'), '조금');
  assert.equal(formatAmount(1, '개'), '1개');
  assert.equal(formatAmount(1.5, '개'), '1.5개');
});
