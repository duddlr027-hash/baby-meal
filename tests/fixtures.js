export const ING = [
  { id: 'zucchini', name: '애호박', section: 'veg', unit: '개', buyStep: 1, pantry: false, kurly: '유기농 애호박' },
  { id: 'carrot', name: '당근', section: 'veg', unit: '개', buyStep: 1, pantry: false, kurly: '흙당근' },
  { id: 'beef_mince', name: '소고기 다짐육', section: 'meat', unit: 'g', buyStep: 100, pantry: false, kurly: '한우 다짐육' },
  { id: 'egg', name: '계란', section: 'meat', unit: '개', buyStep: 10, pantry: false, kurly: '유정란' },
  { id: 'cod', name: '대구살', section: 'fish', unit: 'g', buyStep: 100, pantry: false, kurly: '순살 대구' },
  { id: 'tofu', name: '두부', section: 'tofu_dairy', unit: '모', buyStep: 1, pantry: false, kurly: '유기농 두부' },
  { id: 'cabbage', name: '양배추', section: 'veg', unit: '통', buyStep: 0.5, pantry: false, kurly: '양배추' },
  { id: 'rice', name: '쌀', section: 'grain', unit: 'g', buyStep: 100, pantry: true, kurly: '쌀' },
  { id: 'soy', name: '아기간장', section: 'grain', unit: '', buyStep: 1, pantry: true, kurly: '아기간장' },
];

const R = (id, type, meals, protein, items) => ({ id, name: id, type, meals, protein, items, steps: ['a', 'b'] });

// 일부러 작게: 저녁 main은 m-beef 하나뿐 → 규칙 완화가 일어난다
export const MINI = [
  R('m-beef', 'main', ['breakfast', 'dinner'], 'beef', [{ id: 'beef_mince', qty: 30 }, { id: 'zucchini', qty: 0.25 }, { id: 'rice', qty: 40 }]),
  R('m-egg', 'main', ['breakfast'], 'egg', [{ id: 'egg', qty: 1 }, { id: 'rice', qty: 40 }]),
  R('s-tofu', 'side', ['breakfast', 'dinner'], 'tofu', [{ id: 'tofu', qty: 0.25 }, { id: 'soy' }]),
  R('s-carrot', 'side', ['breakfast', 'dinner'], 'none', [{ id: 'carrot', qty: 0.3 }]),
  R('s-cod', 'side', ['dinner'], 'fish', [{ id: 'cod', qty: 40 }]),
  R('soup-egg', 'soup', ['dinner'], 'egg', [{ id: 'egg', qty: 0.5 }]),
  R('s-cabbage', 'side', ['dinner'], 'none', [{ id: 'cabbage', qty: 0.1 }]),
];

// 첫날 아침에 recipeIds를 순서대로 넣은 계획 (shopping 테스트용, 끼니 구성 무시)
export function planOf(recipeIds) {
  const days = Array.from({ length: 7 }, () => ({ dinnerForm: 'set', breakfast: [], dinner: [] }));
  days[0].breakfast = recipeIds.map((id) => ({ type: 'main', recipeId: id, pinned: false }));
  return { days, warnings: [] };
}

// v2 planner 테스트용
export const ING2 = [
  { id: 'rice', name: '쌀', section: 'grain', unit: 'g', buyStep: 100, pantry: true, kurly: '쌀' },
  { id: 'doenjang', name: '된장', section: 'grain', unit: '', buyStep: 1, pantry: true, kurly: '된장' },
  { id: 'egg', name: '계란', section: 'meat', unit: '개', buyStep: 10, pantry: false, kurly: '유정란' },
  { id: 'beef_mince', name: '소고기 다짐육', section: 'meat', unit: 'g', buyStep: 100, pantry: false, kurly: '한우 다짐육' },
  { id: 'cod', name: '대구살', section: 'fish', unit: 'g', buyStep: 100, pantry: false, kurly: '순살 대구' },
  { id: 'tofu', name: '두부', section: 'tofu_dairy', unit: '모', buyStep: 1, pantry: false, kurly: '두부' },
  { id: 'zucchini', name: '애호박', section: 'veg', unit: '개', buyStep: 1, pantry: false, kurly: '애호박' },
  { id: 'spinach', name: '시금치', section: 'veg', unit: '봉', buyStep: 1, pantry: false, kurly: '시금치' },
  { id: 'carrot', name: '당근', section: 'veg', unit: '개', buyStep: 1, pantry: false, kurly: '당근' },
  { id: 'oat', name: '오트밀', section: 'grain', unit: 'g', buyStep: 100, pantry: false, kurly: '오트밀' },
];

const q = (id, qty) => (qty === undefined ? { id } : { id, qty });
const R2 = (id, type, meals, method, protein, main, items, extra = {}) =>
  ({ id, name: id, type, meals, method, protein, main, minutes: 10, items, steps: ['a', 'b'], ...extra });
const BD2 = ['breakfast', 'dinner'];

export const V2 = [
  R2('b-egg', 'bowl', BD2, '볶음', 'egg', ['egg'], [q('egg', 1), q('rice', 40)]),
  R2('b-beef', 'bowl', BD2, '죽', 'beef', ['beef_mince'], [q('beef_mince', 30), q('rice', 30)]),
  R2('b-oat', 'bowl', ['breakfast'], '죽', 'none', ['oat'], [q('oat', 30)]),
  R2('r-plain', 'rice', ['dinner'], '밥', 'none', [], [q('rice', 40)], { everyday: true }),
  R2('r-zuc', 'rice', ['dinner'], '밥', 'none', ['zucchini'], [q('zucchini', 0.2), q('rice', 40)]),
  R2('s-egg', 'soup', ['dinner'], '국', 'egg', ['egg'], [q('egg', 0.5)]),
  R2('s-tofu', 'soup', ['dinner'], '국', 'tofu', ['tofu', 'doenjang'], [q('tofu', 0.2), q('doenjang')]),
  R2('s-spin', 'soup', ['dinner'], '국', 'none', ['spinach', 'doenjang'], [q('spinach', 0.1), q('doenjang')]),
  R2('d-egg', 'side', ['dinner'], '찜', 'egg', ['egg'], [q('egg', 1)]),
  R2('d-zuc', 'side', ['dinner'], '볶음', 'none', ['zucchini'], [q('zucchini', 0.3)]),
  R2('d-cod', 'side', ['dinner'], '구이', 'fish', ['cod'], [q('cod', 40)]),
  R2('d-tofu', 'side', ['dinner'], '조림', 'tofu', ['tofu'], [q('tofu', 0.25)]),
  R2('d-brothy', 'side', ['dinner'], '국', 'none', ['carrot'], [q('carrot', 0.2)]),
];
