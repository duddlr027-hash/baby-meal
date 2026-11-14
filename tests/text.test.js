import { test } from 'node:test';
import assert from 'node:assert/strict';
import { titleFor, formatViews } from '../js/text.js';

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

test('formatViews: 1만 미만은 천 단위 쉼표, 이상은 만 단위 소수 한 자리', () => {
  assert.equal(formatViews(3669), '3,669');
  assert.equal(formatViews(13000), '1.3만');
  assert.equal(formatViews(228000), '22.8만');
  assert.equal(formatViews(20000), '2만');
  assert.equal(formatViews(612000), '61.2만');
});
