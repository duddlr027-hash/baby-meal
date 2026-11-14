// 재료 사전: section = 장보기 분류, buyStep = 구매 단위(unit 기준), pantry = 상비 재료, kurly = 컬리 검색어
const I = (id, name, section, unit, buyStep, pantry, kurly) => ({ id, name, section, unit, buyStep, pantry, kurly });

export const INGREDIENTS = [
  // 채소·과일
  I('zucchini', '애호박', 'veg', '개', 1, false, '유기농 애호박'),
  I('carrot', '당근', 'veg', '개', 1, false, '흙당근'),
  I('onion', '양파', 'veg', '개', 1, false, '양파'),
  I('potato', '감자', 'veg', '개', 1, false, '감자'),
  I('sweet_potato', '고구마', 'veg', '개', 1, false, '고구마'),
  I('broccoli', '브로콜리', 'veg', '송이', 1, false, '브로콜리'),
  I('spinach', '시금치', 'veg', '봉', 1, false, '시금치'),
  I('pumpkin', '단호박', 'veg', '개', 1, false, '단호박'),
  I('enoki', '팽이버섯', 'veg', '봉', 1, false, '팽이버섯'),
  I('bean_sprout', '콩나물', 'veg', '봉', 1, false, '무농약 콩나물'),
  I('radish', '무', 'veg', '개', 1, false, '무'),
  I('green_onion', '대파', 'veg', '대', 1, false, '대파'),
  // 육류·계란
  I('beef_mince', '소고기 다짐육', 'meat', 'g', 100, false, '한우 다짐육'),
  I('beef_stew', '소고기 국거리', 'meat', 'g', 100, false, '한우 국거리'),
  I('chicken_breast', '닭가슴살', 'meat', 'g', 100, false, '닭안심'),
  I('egg', '계란', 'meat', '개', 10, false, '유정란'),
  // 생선·해산물
  I('cod', '대구살', 'fish', 'g', 100, false, '순살 대구'),
  I('salmon', '연어', 'fish', 'g', 100, false, '생연어'),
  I('mackerel', '고등어 순살', 'fish', 'g', 100, false, '순살 고등어'),
  I('flatfish', '가자미살', 'fish', 'g', 100, false, '손질 가자미'),
  I('pollack', '황태채', 'fish', 'g', 100, false, '황태채'),
  I('dried_shrimp', '밥새우', 'fish', 'g', 100, false, '밥새우'),
  I('anchovy', '잔멸치', 'fish', 'g', 100, false, '지리멸치'),
  // 두부·유제품
  I('tofu', '두부', 'tofu_dairy', '모', 1, false, '유기농 두부'),
  I('cheese', '아기치즈', 'tofu_dairy', '장', 10, false, '아기치즈'),
  I('soft_tofu', '순두부', 'tofu_dairy', '봉', 1, false, '순두부'),
  I('milk', '우유', 'tofu_dairy', 'ml', 200, false, '유기농 우유'),
  // 곡류·가공·양념
  I('noodle', '아기국수', 'grain', 'g', 100, false, '아기 국수'),
  I('oat', '오트밀', 'grain', 'g', 100, false, '유기농 오트밀'),
  I('curry', '아기 카레가루', 'grain', 'g', 100, false, '아기 카레'),
  I('miyeok', '건미역', 'grain', '봉', 1, false, '자른 미역'),
  I('rice', '쌀', 'grain', 'g', 100, true, '쌀'),
  I('soy', '아기간장', 'grain', '', 1, true, '아기간장'),
  I('doenjang', '된장', 'grain', '', 1, true, '아기 된장'),
  I('sesame_oil', '참기름', 'grain', '', 1, true, '참기름'),
  I('sesame', '깨', 'grain', '', 1, true, '볶음참깨'),
  I('oil', '식용유', 'grain', '', 1, true, '현미유'),
  I('starch', '전분', 'grain', '', 1, true, '감자전분'),
];
