import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../js/storage.js';

function fakeStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    key: (i) => [...m.keys()][i] ?? null,
    get length() { return m.size; },
    _m: m,
  };
}
const throwing = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); }, removeItem() {}, key() { return null; }, length: 0 };

test('기본값', () => {
  const s = createStore(fakeStorage());
  assert.equal(s.loadSettings(), null);
  assert.equal(s.loadPlan('2026-11-09'), null);
  assert.deepEqual(s.loadChecks('2026-11-09'), {});
  assert.equal(s.isPersistent(), true);
});

test('bm: 접두사로 저장·복원', () => {
  const b = fakeStorage();
  const s = createStore(b);
  s.saveSettings({ name: '도윤', excluded: [] });
  s.savePlan('2026-11-09', { days: [], warnings: [] });
  s.saveChecks('2026-11-09', { egg: true });
  assert.ok(b._m.has('bm:settings') && b._m.has('bm:plan:2026-11-09') && b._m.has('bm:checks:2026-11-09'));
  const s2 = createStore(b);
  assert.equal(s2.loadSettings().name, '도윤');
  assert.deepEqual(s2.loadChecks('2026-11-09'), { egg: true });
});

test('깨진 JSON은 기본값', () => {
  const b = fakeStorage();
  b.setItem('bm:settings', '{oops');
  assert.equal(createStore(b).loadSettings(), null);
});

test('clearAll은 bm: 키만 지운다', () => {
  const b = fakeStorage();
  b.setItem('other', '1');
  const s = createStore(b);
  s.saveSettings({ name: 'a' });
  s.savePlan('2026-11-09', {});
  s.clearAll();
  assert.deepEqual([...b._m.keys()], ['other']);
  assert.equal(s.loadSettings(), null);
});

test('저장소가 예외를 던지면 메모리로 동작', () => {
  const s = createStore(throwing);
  s.saveSettings({ name: '하나' });
  assert.equal(s.isPersistent(), false);
  assert.equal(s.loadSettings().name, '하나');
});

test('backend가 null이면 메모리', () => {
  const s = createStore(null);
  assert.equal(s.isPersistent(), false);
  s.saveChecks('w', { a: true });
  assert.deepEqual(s.loadChecks('w'), { a: true });
});

function writeOnlyBroken(initial) {
  const b = fakeStorage();
  for (const [k, v] of Object.entries(initial)) b._m.set(k, v);
  b.setItem = () => { throw new Error('quota'); };
  return b;
}

test('쓰기가 한 번 실패해도 디스크의 기존 데이터는 계속 읽힌다', () => {
  const b = writeOnlyBroken({ 'bm:settings': JSON.stringify({ name: '도윤', excluded: [] }) });
  const s = createStore(b);
  s.saveChecks('w', { egg: true });
  assert.equal(s.isPersistent(), false);
  assert.equal(s.loadSettings().name, '도윤');
  assert.deepEqual(s.loadChecks('w'), { egg: true });
});

test('쓰기 실패 뒤에도 clearAll은 backend의 bm: 키를 지운다', () => {
  const b = writeOnlyBroken({ 'bm:settings': '{"name":"도윤"}', 'bm:plan:w': '{}', other: '1' });
  const s = createStore(b);
  s.saveChecks('w', {});
  assert.equal(s.isPersistent(), false);
  s.clearAll();
  assert.deepEqual([...b._m.keys()], ['other']);
  assert.equal(s.loadSettings(), null);
});
