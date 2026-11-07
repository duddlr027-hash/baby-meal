import { test } from 'node:test';
import assert from 'node:assert/strict';
import { titleFor } from '../js/text.js';

test('받침 있으면 "이"를 붙인다', () => {
  assert.equal(titleFor('도윤'), '도윤이 식탁');
});
test('받침 없으면 그대로', () => {
  assert.equal(titleFor('하나'), '하나 식탁');
});
test('한글이 아니거나 비어 있으면', () => {
  assert.equal(titleFor('Leo'), 'Leo 식탁');
  assert.equal(titleFor(''), '우리 아기 식탁');
  assert.equal(titleFor('  '), '우리 아기 식탁');
});
