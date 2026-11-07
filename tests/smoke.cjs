// 사용: (baby-meal 폴더에서) python3 -m http.server 8123 &  →  node tests/smoke.cjs http://localhost:8123/ <스크린샷폴더>
const { chromium, devices } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');

(async () => {
  const url = process.argv[2] || 'http://localhost:8123/';
  const out = process.argv[3] || '.';
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => d.accept());

  await page.goto(url);
  await page.fill('input[name="name"]', '도윤');
  await page.fill('input[name="birthday"]', '2025-03-01');
  await page.fill('textarea[name="message"]', '매일 고생 많아요.\n사랑해요!');
  await page.click('[data-action="draft-exclude"][data-id="shrimp"]');
  await page.click('form[data-form="setup"] button[type="submit"]');

  assert.equal(await page.locator('.day').count(), 7);
  assert.match(await page.locator('.hero h1').textContent(), /도윤이 식탁/);
  assert.equal(await page.locator('.message-card').count(), 0, '설정 직후에는 메시지 안 뜸');
  assert.equal(await page.evaluate(() => window.scrollY), 0);
  await page.screenshot({ path: path.join(out, '1-plan.png'), fullPage: false });

  const firstSide = page.locator('[data-action="toggle"]').nth(1);
  const before = await firstSide.textContent();
  await page.locator('[data-action="reroll"]').nth(1).click();
  assert.notEqual(await page.locator('[data-action="toggle"]').nth(1).textContent(), before);

  await page.locator('[data-action="toggle"]').first().click();
  assert.equal(await page.locator('.recipe').count(), 1);

  await page.locator('[data-action="pick"]').first().click();
  assert.equal(await page.locator('.sheet').count(), 1);
  await page.fill('.search', '연어');
  await page.locator('[data-action="choose"]').first().click();
  assert.match(await page.locator('[data-action="toggle"]').first().textContent(), /연어/);
  assert.equal(await page.locator('[data-action="unpin"]').count(), 1);
  await page.screenshot({ path: path.join(out, '2-picked.png') });

  await page.click('[data-action="tab"][data-tab="shop"]');
  const id = await page.locator('input[data-action="check"]').first().getAttribute('data-id');
  await page.locator(`input[data-action="check"][data-id="${id}"]`).check();
  assert.match(await page.locator('.progress').textContent(), /^\s*1 \/ /);
  assert.ok((await page.locator('a.kurly').first().getAttribute('href')).startsWith('https://www.kurly.com/search?sword='));
  await page.screenshot({ path: path.join(out, '3-shop.png'), fullPage: true });

  await page.reload();
  assert.equal(await page.locator('.message-card').count(), 1, '다시 열면 메시지가 뜬다');
  await page.screenshot({ path: path.join(out, '4-message.png') });
  await page.click('[data-action="close-message"]');
  await page.click('[data-action="tab"][data-tab="shop"]');
  assert.ok(await page.locator(`input[data-action="check"][data-id="${id}"]`).isChecked(), '체크 유지');
  assert.match(await page.locator('.progress').textContent(), /^\s*1 \/ /);
  await page.reload();
  assert.equal(await page.locator('.message-card').count(), 0, '메시지는 한 번만');

  await page.click('[data-action="tab"][data-tab="settings"]');
  await page.screenshot({ path: path.join(out, '5-settings.png'), fullPage: true });

  const longMsg = Array.from({ length: 40 }, (_, i) => `${i + 1}번째 줄 사랑해요`).join('\n');
  await page.fill('textarea[name="message"]', longMsg);
  await page.click('form[data-form="settings"] button[type="submit"]');
  assert.equal(await page.evaluate(() => window.scrollY), 0, '저장 후 맨 위로');
  await page.fill('input[name="name"]', '도윤이');
  await page.click('[data-action="show-message"]');
  assert.equal(await page.inputValue('input[name="name"]'), '도윤이', '저장 전 입력 유지');
  const closeBtn = page.locator('button[data-action="close-message"]');
  await closeBtn.scrollIntoViewIfNeeded();
  assert.ok(await closeBtn.isVisible());
  const box = await closeBtn.boundingBox();
  const vp = page.viewportSize();
  assert.ok(box.y >= 0 && box.y + box.height <= vp.height, '닫기 버튼이 화면 안');
  await page.screenshot({ path: path.join(out, '6-long-message.png') });
  await closeBtn.click();
  assert.equal(await page.locator('.message-card').count(), 0);

  assert.deepEqual(errors, []);
  await browser.close();
  console.log('SMOKE OK');
})().catch((e) => { console.error(e); process.exit(1); });
