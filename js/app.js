import { INGREDIENTS } from './data/ingredients.js?v=3';
import { RECIPES } from './data/recipes.js?v=3';
import { generateWeek, refreshPlan, rerollSlot, candidatesFor, setSlot, unpinSlot, PLAN_VERSION, MEALS, MEAL_LABEL, TYPE_LABEL } from './planner.js?v=3';
import { buildShoppingList, formatAmount, SECTIONS } from './shopping.js?v=3';
import { weekStart, addDays, ageInMonths, weekLabel, dayLabel } from './dates.js?v=3';
import { titleFor, formatViews } from './text.js?v=3';
import { createStore } from './storage.js?v=3';

const store = createStore();
const recipeById = new Map(RECIPES.map((r) => [r.id, r]));
const ingById = new Map(INGREDIENTS.map((i) => [i.id, i]));
const app = document.getElementById('app');

const state = {
  settings: store.loadSettings(),
  draft: null,
  tab: 'plan',
  week: weekStart(new Date()),
  plan: null,
  checks: {},
  open: new Set(),
  picker: null,       // { dayIndex, meal, slotIndex, query }
  message: false,     // false | 'auto' | 'preview'
  flash: '',
  migrated: false,    // 이전 버전 저장 계획을 새로 짠 직후 안내 배너
  settingsDraft: null, // 저장 전 설정 폼 값 { name, birthday, message }
  previewText: '',
};
let currentWeek = state.week; // 마지막으로 확인한 "이번 주"

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const data = () => ({ recipes: RECIPES, ingredients: INGREDIENTS, excluded: state.settings?.excluded ?? [] });
const posOf = (el) => ({ dayIndex: Number(el.dataset.day), meal: el.dataset.meal, slotIndex: Number(el.dataset.slot) });
const toggleIn = (arr, v) => { const i = arr.indexOf(v); if (i >= 0) arr.splice(i, 1); else arr.push(v); return i < 0; };

function loadWeek() {
  const saved = store.loadPlan(state.week);
  state.migrated = !!saved && saved.version !== PLAN_VERSION;
  state.plan = saved ? refreshPlan({ ...data(), plan: saved }) : generateWeek(data());
  store.savePlan(state.week, state.plan);
  state.checks = store.loadChecks(state.week);
}

function updatePlan(plan) {
  state.plan = plan;
  store.savePlan(state.week, plan);
  render();
}

/* ---------- render ---------- */

function render() {
  if (!state.settings) { app.innerHTML = renderSetup(); return; }
  const body = state.tab === 'plan' ? renderPlan() : state.tab === 'shop' ? renderShop() : renderSettings();
  app.innerHTML = `
    ${store.isPersistent() ? '' : '<div class="banner warn">저장이 안 되는 환경이에요. 창을 닫으면 내용이 사라질 수 있어요.</div>'}
    <main class="content">${body}</main>
    ${renderTabs()}
    ${state.picker ? renderPicker() : ''}
    ${state.message ? renderMessage() : ''}`;
}

function renderHeader() {
  const { name, birthday } = state.settings;
  const age = birthday ? `<span class="age">${ageInMonths(birthday, new Date())}개월</span>` : '';
  return `<header class="hero"><h1>${esc(titleFor(name))}</h1>${age}</header>`;
}

function renderPlan() {
  const p = state.plan;
  return `${renderHeader()}
    <div class="week-nav">
      <button data-action="week" data-delta="-7" aria-label="이전 주">◀</button>
      <button class="week-label" data-action="this-week" aria-label="이번 주로">${weekLabel(state.week)}</button>
      <button data-action="week" data-delta="7" aria-label="다음 주">▶</button>
    </div>
    ${state.migrated ? '<div class="banner">새 버전으로 이번 주 식단을 새로 짰어요</div>' : ''}
    ${p.warnings.map((w) => `<div class="banner">${esc(w)}</div>`).join('')}
    ${p.days.map((day, d) => `
      <section class="card day">
        <h2>${dayLabel(state.week, d)}</h2>
        ${MEALS.map((meal) => `
          <div class="meal"><h3>${MEAL_LABEL[meal]}</h3>
            ${day[meal].map((slot, s) => renderSlot(slot, d, meal, s)).join('')}
          </div>`).join('')}
      </section>`).join('')}
    <button class="primary wide" data-action="regen">이번 주 새로 짜기</button>
    <p class="hint">📌 직접 고른 메뉴는 새로 짜도 그대로 남아요</p>`;
}

function renderSlot(slot, d, meal, s) {
  const pos = `data-day="${d}" data-meal="${meal}" data-slot="${s}"`;
  const recipe = slot.recipeId && recipeById.get(slot.recipeId);
  const pickBtn = `<button class="icon" data-action="pick" ${pos} aria-label="직접 고르기">✋</button>`;
  if (!recipe) {
    return `<div class="slot empty"><span class="type">${TYPE_LABEL[slot.type]}</span><span class="name muted">맞는 메뉴가 없어요</span><span></span><span></span>${pickBtn}</div>`;
  }
  const key = `${d}-${meal}-${s}`;
  const open = state.open.has(key);
  const excludedHit = recipe.items.some((it) => (state.settings.excluded ?? []).includes(it.id));
  return `<div class="slot${open ? ' open' : ''}">
    <span class="type">${TYPE_LABEL[slot.type]}</span>
    <button class="name" data-action="toggle" data-key="${key}" aria-expanded="${open}">${esc(recipe.name)}</button>
    ${slot.pinned ? `<button class="icon pin" data-action="unpin" ${pos} aria-label="고정 해제">📌</button>` : '<span></span>'}
    <button class="icon" data-action="reroll" ${pos} aria-label="다른 메뉴로">🔄</button>
    ${pickBtn}
    ${excludedHit ? '<span class="slot-note">제외 재료 포함</span>' : ''}
    ${open ? renderRecipe(recipe) : ''}
  </div>`;
}

function renderRecipe(r) {
  const items = r.items.map((it) => {
    const ing = ingById.get(it.id);
    return `<li>${esc(ing.name)} <span class="muted">${it.qty ? formatAmount(it.qty, ing.unit) : '약간'}</span></li>`;
  }).join('');
  const source = r.source
    ? `<a class="source" href="${esc(r.source.url)}" target="_blank" rel="noopener">원문 보기 · 조회수 ${formatViews(r.source.views)}</a>`
    : '';
  return `<div class="recipe"><p class="minutes">⏱ ${r.minutes}분</p>${source}<ul>${items}</ul><ol>${r.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>`;
}

function renderShop() {
  const list = buildShoppingList({ plan: state.plan, recipes: RECIPES, ingredients: INGREDIENTS });
  const isChecked = (id) => !!state.checks[id];
  const all = list.sections.flatMap((s) => s.items);
  const done = all.filter((i) => isChecked(i.id)).length;
  return `<header class="hero"><h1>장보기</h1><span class="age">${weekLabel(state.week)}</span></header>
    <p class="progress">${done} / ${all.length} 담았어요</p>
    ${list.sections.map((sec) => {
      const items = [...sec.items].sort((a, b) => isChecked(a.id) - isChecked(b.id));
      return `<section class="card shop"><h2>${sec.label}</h2><ul>
        ${items.map((i) => `<li class="${isChecked(i.id) ? 'done' : ''}">
          <label><input type="checkbox" data-action="check" data-id="${i.id}" ${isChecked(i.id) ? 'checked' : ''}>
          <span class="iname">${esc(i.name)}</span><span class="qty">${esc(i.qtyText)}</span></label>
          <a class="kurly" href="${esc(i.kurlyUrl)}" target="_blank" rel="noopener">컬리</a>
        </li>`).join('')}
      </ul></section>`;
    }).join('')}
    ${list.pantry.length ? `<details class="card"><summary>기본 양념 확인 (${list.pantry.length})</summary>
      <p class="muted">${list.pantry.map((p) => esc(p.name)).join(' · ')}</p></details>` : ''}`;
}

function profileFields(s) {
  return `
    <label>아기 이름<input name="name" required maxlength="20" autocomplete="off" value="${esc(s.name)}"></label>
    <label>생일<input name="birthday" type="date" required value="${esc(s.birthday)}"></label>
    <label>첫 화면 메시지<textarea name="message" rows="4" placeholder="처음 열었을 때 보여줄 메시지">${esc(s.message)}</textarea></label>`;
}

function renderChips(excluded, action) {
  const on = new Set(excluded);
  return SECTIONS.map((sec) => {
    const ings = INGREDIENTS.filter((i) => i.section === sec.id);
    if (!ings.length) return '';
    return `<div class="chip-group"><h4>${sec.label}</h4>${ings.map((i) =>
      `<button type="button" class="chip${on.has(i.id) ? ' on' : ''}" data-action="${action}" data-id="${i.id}" aria-pressed="${on.has(i.id)}">${esc(i.name)}</button>`
    ).join('')}</div>`;
  }).join('');
}

function renderSetup() {
  const d = (state.draft ??= { name: '', birthday: '', message: '', excluded: [] });
  return `<main class="content">
    <header class="hero"><h1>처음 설정</h1></header>
    <p class="muted">아기 정보를 넣으면 이번 주 식단을 바로 짜 드려요.</p>
    <form class="card form" data-form="setup">
      ${profileFields(d)}
      <h2>제외 재료 <span class="muted small">알레르기·안 먹는 재료</span></h2>
      ${renderChips(d.excluded, 'draft-exclude')}
      <button class="primary wide" type="submit">시작하기</button>
    </form></main>`;
}

function renderSettings() {
  const s = state.settings;
  return `<header class="hero"><h1>설정</h1></header>
    ${state.flash ? `<div class="banner">${esc(state.flash)}</div>` : ''}
    <form class="card form" data-form="settings">
      ${profileFields(state.settingsDraft ?? s)}
      <button class="primary wide" type="submit">저장</button>
    </form>
    <section class="card">
      <h2>제외 재료</h2>
      <p class="muted small">고른 재료가 들어간 메뉴는 추천하지 않아요. 바꾸면 이번 주 식단에 바로 반영돼요.</p>
      ${renderChips(s.excluded, 'exclude')}
    </section>
    <section class="card">
      <button class="wide" data-action="show-message">메시지 다시 보기</button>
      <button class="wide danger" data-action="reset">모든 데이터 초기화</button>
    </section>
    <p class="hint">레시피는 일반적인 유아식 기준으로 만든 참고용이에요. 아기에게 맞게 조절해 주세요.</p>`;
}

const TABS = [['plan', '🍚', '식단'], ['shop', '🛒', '장보기'], ['settings', '⚙️', '설정']];
function renderTabs() {
  return `<nav class="tabs">${TABS.map(([id, icon, label]) =>
    `<button data-action="tab" data-tab="${id}" class="${state.tab === id ? 'active' : ''}"><span>${icon}</span>${label}</button>`
  ).join('')}</nav>`;
}

function renderPicker() {
  const { dayIndex, meal, slotIndex, query } = state.picker;
  const type = state.plan.days[dayIndex][meal][slotIndex].type;
  return `<div class="sheet-backdrop" data-action="close-picker"></div>
    <div class="sheet" role="dialog" aria-label="메뉴 고르기">
      <div class="sheet-head"><strong>${dayLabel(state.week, dayIndex)} ${MEAL_LABEL[meal]} · ${TYPE_LABEL[type]}</strong>
        <button class="icon" data-action="close-picker" aria-label="닫기">✕</button></div>
      <input class="search" type="search" placeholder="메뉴 검색" value="${esc(query)}" data-input="picker-query">
      <ul id="picker-list" class="picker-list">${renderPickerList()}</ul>
    </div>`;
}

function renderPickerList() {
  const { dayIndex, meal, slotIndex, query } = state.picker;
  const q = query.trim();
  const current = state.plan.days[dayIndex][meal][slotIndex].recipeId;
  const list = candidatesFor({ ...data(), plan: state.plan, dayIndex, meal, slotIndex })
    .filter((c) => !q || c.recipe.name.includes(q));
  if (!list.length) return '<li class="muted">맞는 메뉴가 없어요</li>';
  return list.map(({ recipe, notes }) => `<li><button data-action="choose" data-id="${recipe.id}" class="${recipe.id === current ? 'current' : ''}">
      <span>${esc(recipe.name)}</span>${notes.map((n) => `<small>${esc(n)}</small>`).join('')}</button></li>`).join('');
}

function renderMessage() {
  const text = state.message === 'preview' ? state.previewText : state.settings.message;
  return `<div class="sheet-backdrop"${state.message === 'preview' ? ' data-action="close-message"' : ''}></div>
    <div class="message-card" role="dialog" aria-label="메시지">
      <p class="from">💌</p>
      <p class="msg">${esc(text).replace(/\n/g, '<br>')}</p>
      <button class="primary wide" data-action="close-message">닫기</button>
    </div>`;
}

/* ---------- events ---------- */

app.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  switch (el.dataset.action) {
    case 'tab':
      state.tab = el.dataset.tab; state.flash = ''; state.migrated = false; state.settingsDraft = null; render(); window.scrollTo(0, 0); break;
    case 'week':
      state.week = addDays(state.week, Number(el.dataset.delta)); state.open.clear(); loadWeek(); render(); break;
    case 'this-week': {
      const now = weekStart(new Date());
      if (state.week !== now) { state.week = now; state.open.clear(); loadWeek(); render(); }
      break;
    }
    case 'toggle': {
      const k = el.dataset.key;
      if (state.open.has(k)) state.open.delete(k); else state.open.add(k);
      render(); break;
    }
    case 'reroll':
      updatePlan(rerollSlot({ ...data(), plan: state.plan, ...posOf(el) })); break;
    case 'unpin':
      updatePlan(unpinSlot({ plan: state.plan, ...posOf(el) })); break;
    case 'regen':
      state.open.clear(); updatePlan(generateWeek({ ...data(), existingPlan: state.plan })); break;
    case 'pick':
      state.picker = { ...posOf(el), query: '' }; render(); break;
    case 'close-picker':
      state.picker = null; render(); break;
    case 'choose': {
      const { dayIndex, meal, slotIndex } = state.picker;
      state.picker = null;
      updatePlan(setSlot({ plan: state.plan, dayIndex, meal, slotIndex, recipeId: el.dataset.id }));
      break;
    }
    case 'draft-exclude': {
      const on = toggleIn(state.draft.excluded, el.dataset.id);
      el.classList.toggle('on', on); el.setAttribute('aria-pressed', String(on)); break;
    }
    case 'exclude': {
      const on = toggleIn(state.settings.excluded, el.dataset.id);
      el.classList.toggle('on', on); el.setAttribute('aria-pressed', String(on));
      store.saveSettings(state.settings);
      state.plan = refreshPlan({ ...data(), plan: state.plan });
      store.savePlan(state.week, state.plan);
      break;
    }
    case 'show-message': {
      const form = app.querySelector('form[data-form="settings"]');
      if (form) {
        const f = new FormData(form);
        state.settingsDraft = { name: String(f.get('name') ?? ''), birthday: String(f.get('birthday') ?? ''), message: String(f.get('message') ?? '') };
      }
      const text = (state.settingsDraft ? state.settingsDraft.message : state.settings.message).trim();
      if (text) { state.previewText = text; state.message = 'preview'; render(); }
      else { state.flash = '메시지가 비어 있어요'; render(); }
      break;
    }
    case 'close-message':
      if (state.message === 'auto') { state.settings.messageSeen = true; store.saveSettings(state.settings); }
      state.message = false; render(); break;
    case 'reset':
      if (window.confirm('식단, 장보기 체크, 설정이 모두 지워져요. 초기화할까요?')) {
        store.clearAll();
        Object.assign(state, { settings: null, draft: null, plan: null, checks: {}, tab: 'plan', picker: null, message: false, flash: '', settingsDraft: null });
        state.open.clear();
        render();
      }
      break;
  }
});

app.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset.action !== 'check') return;
  if (el.checked) state.checks[el.dataset.id] = true;
  else delete state.checks[el.dataset.id];
  store.saveChecks(state.week, state.checks);
  render();
});

app.addEventListener('input', (e) => {
  if (e.target.dataset.input !== 'picker-query' || !state.picker) return;
  state.picker.query = e.target.value;
  document.getElementById('picker-list').innerHTML = renderPickerList();
});

app.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const f = new FormData(form);
  const profile = {
    name: String(f.get('name') ?? '').trim(),
    birthday: String(f.get('birthday') ?? ''),
    message: String(f.get('message') ?? '').trim(),
  };
  if (form.dataset.form === 'setup') {
    // 설정한 사람(남편)에게는 메시지를 띄우지 않는다. 다음에 열 때 보인다.
    state.settings = { ...profile, excluded: [...state.draft.excluded], messageSeen: false };
    state.draft = null;
    store.saveSettings(state.settings);
    state.tab = 'plan';
    loadWeek();
  } else {
    const messageChanged = profile.message !== state.settings.message;
    state.settings = { ...state.settings, ...profile, messageSeen: messageChanged ? false : state.settings.messageSeen };
    store.saveSettings(state.settings);
    state.flash = '저장했어요';
    state.settingsDraft = null;
  }
  render();
  window.scrollTo(0, 0);
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible' || !state.settings) return;
  const now = weekStart(new Date());
  if (now === currentWeek) return;
  const viewingOld = state.week === currentWeek;
  currentWeek = now;
  if (viewingOld) { state.week = now; state.open.clear(); loadWeek(); render(); }
});

/* ---------- start ---------- */

try { navigator.storage?.persist?.(); } catch { /* 지원 안 하는 브라우저 */ }

if (state.settings) {
  loadWeek();
  if (!state.settings.messageSeen && state.settings.message) state.message = 'auto';
}
render();
