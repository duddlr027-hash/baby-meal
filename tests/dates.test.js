import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toISO, parseISO, weekStart, addDays, weekLabel, dayLabel, ageInMonths } from '../js/dates.js';

test('toISO / parseISO 왕복', () => {
  assert.equal(toISO(new Date(2026, 0, 5)), '2026-01-05');
  assert.equal(toISO(parseISO('2026-11-07')), '2026-11-07');
});

test('weekStart는 월요일을 돌려준다', () => {
  assert.equal(weekStart(new Date(2026, 10, 7)), '2026-11-02'); // 토
  assert.equal(weekStart(new Date(2026, 10, 8)), '2026-11-02'); // 일
  assert.equal(weekStart(new Date(2026, 10, 9)), '2026-11-09'); // 월
});

test('addDays는 월·연도 경계를 넘는다', () => {
  assert.equal(addDays('2026-12-28', 7), '2027-01-04');
  assert.equal(addDays('2026-11-09', -7), '2026-11-02');
});

test('weekLabel / dayLabel', () => {
  assert.equal(weekLabel('2026-11-09'), '11/9 – 11/15');
  assert.equal(dayLabel('2026-11-09', 0), '11/9 (월)');
  assert.equal(dayLabel('2026-11-09', 6), '11/15 (일)');
});

test('ageInMonths는 만 개월', () => {
  const today = new Date(2026, 10, 7);
  assert.equal(ageInMonths('2025-04-01', today), 19);
  assert.equal(ageInMonths('2025-04-07', today), 19);
  assert.equal(ageInMonths('2025-04-08', today), 18);
  assert.equal(ageInMonths('2026-12-01', today), 0);
});
