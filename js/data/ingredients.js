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
  I('cabbage', '양배추', 'veg', '통', 0.5, false, '양배추'),
  I('pumpkin', '단호박', 'veg', '개', 1, false, '단호박'),
  I('shiitake', '표고버섯', 'veg', '팩', 1, false, '표고버섯'),
  I('enoki', '팽이버섯', 'veg', '봉', 1, false, '팽이버섯'),
  I('bean_sprout', '콩나물', 'veg', '봉', 1, false, '무농약 콩나물'),
  I('paprika', '파프리카', 'veg', '개', 1, false, '파프리카'),
  I('radish', '무', 'veg', '개', 1, false, '무'),
  I('tomato', '토마토', 'veg', '개', 1, false, '완숙 토마토'),
  I('green_onion', '대파', 'veg', '대', 1, false, '대파'),
  I('bok_choy', '청경채', 'veg', '봉', 1, false, '청경채'),
  // 육류·계란
  I('beef_mince', '소고기 다짐육', 'meat', 'g', 100, false, '한우 다짐육'),
  I('beef_stew', '소고기 국거리', 'meat', 'g', 100, false, '한우 국거리'),
  I('chicken_breast', '닭가슴살', 'meat', 'g', 100, false, '닭안심'),
  I('chicken_thigh', '닭다리살', 'meat', 'g', 100, false, '닭다리살 정육'),
  I('pork_mince', '돼지고기 다짐육', 'meat', 'g', 100, false, '한돈 다짐육'),
  I('egg', '계란', 'meat', '개', 10, false, '유정란'),
  // 생선·해산물
  I('cod', '대구살', 'fish', 'g', 100, false, '순살 대구'),
  I('salmon', '연어', 'fish', 'g', 100, false, '생연어'),
  I('shrimp', '새우살', 'fish', 'g', 100, false, '칵테일 새우'),
  I('anchovy', '잔멸치', 'fish', 'g', 100, false, '지리멸치'),
  // 두부·유제품
  I('tofu', '두부', 'tofu_dairy', '모', 1, false, '유기농 두부'),
  I('cheese', '아기치즈', 'tofu_dairy', '장', 10, false, '아기치즈'),
  I('milk', '우유', 'tofu_dairy', 'ml', 200, false, '유기농 우유'),
  // 곡류·가공·양념
  I('noodle', '아기국수', 'grain', 'g', 100, false, '아기 국수'),
  I('oat', '오트밀', 'grain', 'g', 100, false, '유기농 오트밀'),
  I('seaweed', '아기김', 'grain', '봉', 1, false, '아기김'),
  I('miyeok', '건미역', 'grain', '봉', 1, false, '자른 미역'),
  I('multigrain', '혼합잡곡', 'grain', 'g', 100, false, '유기농 혼합잡곡'),
  I('rice', '쌀', 'grain', 'g', 100, true, '쌀'),
  I('soy', '아기간장', 'grain', '', 1, true, '아기간장'),
  I('doenjang', '된장', 'grain', '', 1, true, '아기 된장'),
  I('sesame_oil', '참기름', 'grain', '', 1, true, '참기름'),
  I('sesame', '깨', 'grain', '', 1, true, '볶음참깨'),
  I('oil', '식용유', 'grain', '', 1, true, '현미유'),
  I('starch', '전분', 'grain', '', 1, true, '감자전분'),
];
