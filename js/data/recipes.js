// 아기 식단 레시피 46개 (bowl 15 / rice 5 / soup 11 / side 15) — 모두 15분 이내, 핵심 재료 3개 이하
// items: 'id:수량' 쉼표 목록, 수량 없는 항목은 상비 재료(표시 "약간")
// main: 겹침 검사용 메인 재료 id, minutes: 손이 가는 시간(밥솥 시간 제외)
const B = ['breakfast'];
const D = ['dinner'];
const BD = ['breakfast', 'dinner'];

const items = (s) =>
  s.split(',').map((t) => {
    const [id, qty] = t.trim().split(':');
    return qty === undefined ? { id } : { id, qty: Number(qty) };
  });

const R = (id, name, type, meals, method, protein, main, minutes, itemStr, steps, extra = {}) => ({
  id, name, type, meals, method, protein, main, minutes, items: items(itemStr), steps, ...extra,
});

export const RECIPES = [
  // ---- bowl (15) ----
  R('beef-zucchini-porridge', '소고기 애호박죽', 'bowl', B, '죽', 'beef', ['beef_mince'], 15, 'beef_mince:30, zucchini:0.25, rice:30', [
    '애호박은 0.5cm 크기로 잘게 다져요.',
    '냄비에 소고기와 물을 넣고 끓이다가 지어 둔 진밥과 애호박을 넣어요.',
    '밥알이 퍼지고 고기가 푹 익을 때까지 5~10분 저어가며 끓여요.',
  ]),
  R('chicken-carrot-porridge', '닭고기 당근죽', 'bowl', B, '죽', 'chicken', ['chicken_breast'], 15, 'chicken_breast:30, carrot:0.2, rice:30', [
    '닭가슴살과 당근을 5mm 크기로 아주 잘게 다져요.',
    '냄비에 닭고기, 당근, 물을 넣고 끓이다가 지어 둔 진밥을 넣어요.',
    '밥알이 부드럽게 퍼질 때까지 5~10분 저어가며 끓여요.',
  ]),
  R('cod-porridge', '대구살 죽', 'bowl', B, '죽', 'fish', ['cod'], 15, 'cod:30, zucchini:0.2, rice:30', [
    '대구살은 가시가 없는지 꼼꼼히 확인하고 잘게 다져요.',
    '애호박도 잘게 다져 물과 함께 냄비에 끓이다가 지어 둔 진밥을 넣어요.',
    '밥알이 퍼지면 대구살을 넣고 완전히 익을 때까지 5분 더 끓여요.',
  ]),
  R('sweet-potato-oatmeal', '고구마 오트밀', 'bowl', B, '죽', 'none', ['sweet_potato', 'oat'], 10, 'sweet_potato:0.3, oat:30, milk:100', [
    '고구마는 껍질을 벗겨 작게 깍둑썰기해요.',
    '냄비에 우유와 오트밀, 고구마를 넣고 약불에서 저어가며 끓여요.',
    '고구마가 말랑해지면 으깨서 섞어요.',
  ]),
  R('egg-spinach-porridge', '계란 시금치죽', 'bowl', B, '죽', 'egg', ['egg', 'spinach'], 15, 'egg:1, spinach:0.1, rice:30, sesame_oil', [
    '시금치는 잎 부분만 데쳐서 잘게 다져요.',
    '냄비에 지어 둔 진밥과 물을 넣고 5분쯤 끓이다가 시금치를 넣어요.',
    '계란을 풀어 넣고 완전히 익혀 참기름을 한 방울만 둘러요.',
  ]),
  R('pumpkin-cheese-porridge', '단호박 치즈죽', 'bowl', B, '죽', 'none', ['pumpkin'], 15, 'pumpkin:0.2, cheese:1, rice:30', [
    '단호박은 껍질을 벗겨 작게 썰어요.',
    '냄비에 단호박, 지어 둔 진밥, 물을 넣고 5~10분 부드럽게 끓여요.',
    '단호박을 으깨고 불을 끈 뒤 치즈를 넣어 녹여요.',
  ]),
  R('egg-fried-rice', '계란 볶음밥', 'bowl', BD, '볶음', 'egg', ['egg'], 10, 'egg:1, carrot:0.2, rice:40, oil', [
    '당근은 5mm 크기로 잘게 다져요.',
    '기름을 살짝 두른 팬에 당근을 볶다가 계란을 풀어 스크램블해요.',
    '밥을 넣고 고슬고슬하게 볶아요.',
  ]),
  R('beef-veggie-fried-rice', '소고기 채소 볶음밥', 'bowl', BD, '볶음', 'beef', ['beef_mince'], 15, 'beef_mince:30, onion:0.2, paprika:0.25, rice:40, oil', [
    '양파와 파프리카는 5mm 크기로 잘게 다져요.',
    '기름을 살짝 두른 팬에 소고기를 먼저 볶아 완전히 익혀요.',
    '채소와 밥을 넣고 부드럽게 볶아요.',
  ]),
  R('salmon-rice-ball', '연어 주먹밥', 'bowl', BD, '주먹밥', 'fish', ['salmon'], 15, 'salmon:30, seaweed:0.1, rice:40, sesame_oil', [
    '연어는 가시를 확인하고 팬에 속까지 익혀 잘게 부숴요.',
    '밥에 연어, 부순 김, 참기름 한 방울을 섞어요.',
    '한입 크기로 동글게 뭉쳐요.',
  ]),
  R('tomato-egg-rice', '토마토 계란덮밥', 'bowl', BD, '덮밥', 'egg', ['egg', 'tomato'], 10, 'tomato:0.5, egg:1, rice:40, oil', [
    '토마토는 껍질을 벗기고 작게 썰어요.',
    '기름을 살짝 두른 팬에 토마토를 볶아 부드럽게 익혀요.',
    '계란을 풀어 넣고 익힌 뒤 밥 위에 올려요.',
  ]),
  R('tofu-rice-bowl', '두부 덮밥', 'bowl', D, '덮밥', 'tofu', ['tofu'], 15, 'tofu:0.25, onion:0.2, rice:40, soy, starch', [
    '두부와 양파는 작게 깍둑썰기해요.',
    '물에 양파를 먼저 익히고 두부와 아기간장 아주 조금을 넣어요.',
    '전분물로 살짝 걸쭉하게 만들어 밥 위에 올려요.',
  ]),
  R('beef-noodle', '소고기 국수', 'bowl', D, '면', 'beef', ['beef_mince', 'noodle'], 15, 'beef_mince:30, noodle:40, zucchini:0.2, soy', [
    '애호박은 가늘게 채 썬 뒤 짧게 잘라요. 국수도 짧게 잘라요.',
    '끓는 물에 소고기와 애호박을 익히고 아기간장을 아주 조금 넣어요.',
    '국수를 넣고 부드럽게 푹 삶아요.',
  ]),
  R('shrimp-fried-rice', '새우 볶음밥', 'bowl', D, '볶음', 'fish', ['shrimp'], 10, 'shrimp:30, zucchini:0.2, rice:40, oil', [
    '새우살과 애호박은 5mm 크기로 잘게 다져요.',
    '기름을 살짝 두른 팬에 새우를 속까지 익혀요.',
    '애호박과 밥을 넣고 부드럽게 볶아요.',
  ]),
  R('chicken-broccoli-risotto', '닭고기 브로콜리 리조또', 'bowl', D, '리조또', 'chicken', ['chicken_breast'], 15, 'chicken_breast:30, broccoli:0.2, milk:100, rice:40', [
    '닭가슴살과 브로콜리 송이 부분을 5mm 크기로 잘게 다져요.',
    '냄비에 우유와 밥, 닭고기를 넣고 약불에서 저어가며 끓여요.',
    '브로콜리를 넣고 부드러워질 때까지 걸쭉하게 끓여요.',
  ]),
  R('pork-rice-bowl', '돼지고기 덮밥', 'bowl', D, '덮밥', 'pork', ['pork_mince'], 15, 'pork_mince:30, onion:0.2, rice:40, soy', [
    '양파는 5mm 크기로 잘게 다져요.',
    '팬에 돼지고기와 양파를 물을 조금 넣고 속까지 푹 익혀요.',
    '아기간장 아주 조금으로 간하고 밥 위에 올려요.',
  ]),

  // ---- rice (5) ----
  R('plain-rice', '흰 진밥', 'rice', D, '밥', 'none', [], 5, 'rice:40', [
    '쌀을 깨끗이 씻어 밥솥에 안쳐요.',
    '물을 평소보다 넉넉히 넣고 진밥으로 지어요.',
  ], { everyday: true }),
  R('multigrain-rice', '잡곡 진밥', 'rice', D, '밥', 'none', ['multigrain'], 5, 'multigrain:10, rice:30', [
    '잡곡과 쌀을 깨끗이 씻어요.',
    '밥솥에 안치고 물을 넉넉히 넣어 부드러운 진밥으로 지어요.',
  ]),
  R('sweet-potato-rice', '고구마밥', 'rice', D, '밥', 'none', ['sweet_potato'], 10, 'sweet_potato:0.2, rice:40', [
    '고구마는 껍질을 벗겨 작게 깍둑썰기해요.',
    '씻은 쌀과 고구마를 밥솥에 안치고 물을 넉넉히 넣어요.',
    '진밥으로 짓고 다 되면 고구마를 살살 섞어요.',
  ]),
  R('bean-sprout-rice', '콩나물밥', 'rice', D, '밥', 'none', ['bean_sprout'], 10, 'bean_sprout:0.2, rice:40, soy', [
    '콩나물은 머리와 꼬리를 떼고 1cm 길이로 잘게 썰어요.',
    '씻은 쌀 위에 콩나물을 올리고 물을 넉넉히 넣어 밥솥에 안쳐요.',
    '다 되면 아기간장을 아주 조금만 넣어 섞어요.',
  ]),
  R('radish-rice', '무밥', 'rice', D, '밥', 'none', ['radish'], 10, 'radish:0.1, rice:40', [
    '무는 껍질을 벗겨 작게 깍둑썰기해요.',
    '씻은 쌀 위에 무를 올리고 물을 넉넉히 넣어 밥솥에 안쳐요.',
    '진밥으로 짓고 무가 부드러운지 확인해요.',
  ]),

  // ---- soup (11) ----
  R('beef-miyeok-soup', '소고기 미역국', 'soup', D, '국', 'beef', ['beef_stew', 'miyeok'], 15, 'beef_stew:30, miyeok:0.05, sesame_oil, soy', [
    '건미역은 물에 5분 불린 뒤 짧게 잘라 헹구고, 소고기는 잘게 다져요.',
    '냄비에 참기름 한 방울로 소고기와 미역을 볶고 물을 부어요.',
    '푹 끓이다가 아기간장을 아주 조금만 넣어요.',
  ]),
  R('tofu-doenjang-soup', '두부 된장국', 'soup', D, '국', 'tofu', ['tofu', 'doenjang'], 10, 'tofu:0.2, zucchini:0.1, doenjang', [
    '두부와 애호박은 작게 깍둑썰기해요.',
    '물에 된장을 아주 조금만 풀고 애호박을 먼저 끓여요.',
    '두부를 넣고 한소끔 더 끓여요.',
  ]),
  R('egg-soup', '계란국', 'soup', D, '국', 'egg', ['egg'], 10, 'egg:0.5, green_onion:0.1, soy', [
    '대파는 흰 부분만 잘게 다져요.',
    '물에 대파를 끓이고 아기간장을 아주 조금 넣어요.',
    '계란을 풀어 천천히 둘러 넣고 완전히 익혀요.',
  ]),
  R('beef-radish-soup', '소고기 무국', 'soup', D, '국', 'beef', ['beef_stew', 'radish'], 15, 'beef_stew:30, radish:0.1, soy', [
    '무는 얇게 납작썰기하고 소고기는 잘게 다져요.',
    '냄비에 물, 소고기, 무를 넣고 푹 끓여요.',
    '아기간장을 아주 조금만 넣어 간해요.',
  ]),
  R('bean-sprout-soup', '콩나물국', 'soup', D, '국', 'none', ['bean_sprout'], 10, 'bean_sprout:0.2, green_onion:0.1', [
    '콩나물은 머리와 꼬리를 떼고 잘게 썰어요. 대파는 흰 부분만 다져요.',
    '물에 콩나물을 넣고 뚜껑을 덮어 부드럽게 끓여요.',
    '대파를 넣고 한소끔 더 끓여요.',
  ]),
  R('potato-soup', '감자국', 'soup', D, '국', 'none', ['potato'], 15, 'potato:0.3, onion:0.1, soy', [
    '감자와 양파는 작게 깍둑썰기해요.',
    '물에 감자와 양파를 넣고 부드럽게 푹 익혀요.',
    '아기간장을 아주 조금만 넣어 간해요.',
  ]),
  R('cod-soup', '대구 맑은국', 'soup', D, '국', 'fish', ['cod', 'radish'], 15, 'cod:30, radish:0.1', [
    '무는 얇게 납작썰기하고, 대구살은 가시를 확인해 작게 썰어요.',
    '물에 무를 먼저 푹 끓여요.',
    '대구살을 넣고 속까지 익을 때까지 끓여요.',
  ]),
  R('spinach-doenjang-soup', '시금치 된장국', 'soup', D, '국', 'none', ['spinach', 'doenjang'], 10, 'spinach:0.1, doenjang', [
    '시금치는 잎 부분만 데쳐서 잘게 다져요.',
    '물에 된장을 아주 조금만 풀어 끓여요.',
    '시금치를 넣고 한소끔 더 끓여요.',
  ]),
  R('cabbage-soup', '양배추 맑은국', 'soup', D, '국', 'none', ['cabbage'], 10, 'cabbage:0.1, carrot:0.1, soy', [
    '양배추와 당근은 작고 얇게 썰어요.',
    '물에 당근을 먼저 끓이다가 양배추를 넣어요.',
    '채소가 부드러워지면 아기간장을 아주 조금만 넣어요.',
  ]),
  R('chicken-veggie-soup', '닭고기 채소국', 'soup', D, '국', 'chicken', ['chicken_thigh', 'potato'], 15, 'chicken_thigh:30, potato:0.2, carrot:0.1', [
    '닭다리살은 껍질과 기름을 떼고 잘게 다져요. 감자와 당근도 작게 썰어요.',
    '물에 닭고기와 감자, 당근을 넣고 푹 끓여요.',
    '고기가 완전히 익고 채소가 부드러워질 때까지 끓여요.',
  ]),
  R('enoki-soup', '팽이버섯 맑은국', 'soup', D, '국', 'none', ['enoki'], 10, 'enoki:0.3, onion:0.1, soy', [
    '팽이버섯은 밑동을 자르고 짧게 썰어요. 양파는 잘게 다져요.',
    '물에 양파를 먼저 끓이다가 팽이버섯을 넣어요.',
    '부드러워지면 아기간장을 아주 조금만 넣어요.',
  ]),

  // ---- side (15) ----
  R('spinach-namul', '시금치 무침', 'side', D, '무침', 'none', ['spinach'], 10, 'spinach:0.2, sesame_oil, sesame', [
    '시금치는 잎 부분만 데쳐 찬물에 헹구고 물기를 짜요.',
    '잘게 썰어 참기름 한 방울과 곱게 간 깨를 섞어요.',
  ]),
  R('tofu-jorim', '두부 조림', 'side', D, '조림', 'tofu', ['tofu'], 15, 'tofu:0.25, soy', [
    '두부는 작고 납작하게 썰어요.',
    '팬에 물과 아기간장 아주 조금을 넣고 두부를 올려요.',
    '약불에서 국물이 졸아들 때까지 조려요.',
  ]),
  R('steamed-egg', '계란찜', 'side', D, '찜', 'egg', ['egg'], 10, 'egg:1, green_onion:0.1', [
    '계란을 풀고 물을 섞어 체에 한 번 걸러요.',
    '대파를 아주 잘게 다져 넣어요.',
    '뚝배기에 담아 약불에서 뚜껑을 덮고 속까지 익혀요.',
  ]),
  R('zucchini-saute', '애호박 볶음', 'side', D, '볶음', 'none', ['zucchini'], 10, 'zucchini:0.3, oil', [
    '애호박은 얇게 반달썰기해요.',
    '기름을 살짝 두른 팬에 물을 조금 넣고 볶아요.',
    '부드럽게 푹 익힌 뒤 한입 크기로 잘라요.',
  ]),
  R('broccoli-tofu', '브로콜리 두부무침', 'side', D, '무침', 'tofu', ['broccoli', 'tofu'], 10, 'broccoli:0.3, tofu:0.2, sesame_oil', [
    '브로콜리 송이는 데쳐서 잘게 다져요.',
    '두부는 데쳐서 물기를 빼고 으깨요.',
    '브로콜리와 두부, 참기름 한 방울을 버무려요.',
  ]),
  R('potato-saute', '감자 볶음', 'side', D, '볶음', 'none', ['potato'], 15, 'potato:0.5, oil', [
    '감자는 껍질을 벗겨 얇게 채 썬 뒤 짧게 잘라요.',
    '기름을 살짝 두른 팬에 물을 조금 넣고 볶아요.',
    '감자가 투명해지고 부드러워질 때까지 익혀요.',
  ]),
  R('carrot-saute', '당근 볶음', 'side', D, '볶음', 'none', ['carrot'], 10, 'carrot:0.3, oil', [
    '당근은 얇게 채 썬 뒤 짧게 잘라요.',
    '기름을 살짝 두른 팬에 물을 조금 넣고 볶아요.',
    '아주 부드럽게 익힌 뒤 식혀서 줘요.',
  ]),
  R('bean-sprout-namul', '콩나물 무침', 'side', D, '무침', 'none', ['bean_sprout'], 10, 'bean_sprout:0.2, sesame_oil', [
    '콩나물은 머리와 꼬리를 떼고 푹 삶아요.',
    '물기를 빼고 잘게 썰어요.',
    '참기름 한 방울만 넣고 버무려요.',
  ]),
  R('beef-broccoli', '소고기 브로콜리 볶음', 'side', D, '볶음', 'beef', ['beef_mince', 'broccoli'], 15, 'beef_mince:30, broccoli:0.2, oil', [
    '브로콜리 송이는 데쳐서 잘게 다져요.',
    '기름을 살짝 두른 팬에 소고기를 속까지 볶아요.',
    '브로콜리를 넣고 물을 조금 부어 부드럽게 볶아요.',
  ]),
  R('grilled-salmon', '연어 구이', 'side', D, '구이', 'fish', ['salmon'], 15, 'salmon:40, oil', [
    '연어는 가시를 꼼꼼히 확인해요.',
    '기름을 살짝 두른 팬에 약불로 앞뒤로 속까지 익혀요.',
    '한입 크기로 잘게 찢어서 줘요.',
  ]),
  R('grilled-cod', '대구살 구이', 'side', D, '구이', 'fish', ['cod'], 15, 'cod:40, oil', [
    '대구살은 가시를 꼼꼼히 확인하고 물기를 닦아요.',
    '기름을 살짝 두른 팬에 약불로 앞뒤로 속까지 익혀요.',
    '한입 크기로 잘게 찢어서 줘요.',
  ]),
  R('shiitake-saute', '표고 볶음', 'side', D, '볶음', 'none', ['shiitake'], 10, 'shiitake:0.3, soy, sesame_oil', [
    '표고버섯은 기둥을 떼고 잘게 다져요.',
    '팬에 물을 조금 넣고 부드럽게 볶아요.',
    '아기간장과 참기름을 아주 조금만 넣어 섞어요.',
  ]),
  R('pork-saute', '돼지고기 볶음', 'side', D, '볶음', 'pork', ['pork_mince'], 15, 'pork_mince:40, onion:0.1, soy', [
    '양파는 5mm 크기로 잘게 다져요.',
    '팬에 돼지고기와 양파를 물을 조금 넣고 속까지 푹 볶아요.',
    '아기간장을 아주 조금만 넣어 간해요.',
  ]),
  R('bok-choy-namul', '청경채 무침', 'side', D, '무침', 'none', ['bok_choy'], 10, 'bok_choy:0.3, sesame_oil', [
    '청경채는 데쳐서 찬물에 헹구고 물기를 짜요.',
    '잘게 썰어 참기름 한 방울만 넣고 버무려요.',
  ]),
  R('anchovy-stirfry', '잔멸치 볶음', 'side', D, '볶음', 'fish', ['anchovy'], 10, 'anchovy:10, sesame, oil', [
    '잔멸치는 끓는 물에 데쳐 짠맛을 빼고 물기를 빼요.',
    '기름을 살짝 두른 팬에 약불로 볶아요.',
    '곱게 간 깨를 뿌려 섞어요.',
  ]),
];
