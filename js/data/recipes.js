// 아기 식단 레시피 39개 (bowl 13 / rice 3 / soup 9 / side 14) — 집밥 수준, 모두 15분 이내
// 재료(상비 제외): 한 그릇 3개 이하, 밥·국·반찬 2개 이하. 출처는 만개의레시피 유아식 글(사실 정보만 참고, 문장은 새로 씀)
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

// 원문 글: 주소·제목·조회수(수집 시점)
const S = (url, title, views) => ({ source: { url, title, views } });

export const RECIPES = [
  // ---- bowl (13) ----
  R('beef-veggie-porridge', '소고기 채소죽', 'bowl', B, '죽', 'beef', ['beef_mince'], 15, 'beef_mince:30, carrot:0.1, zucchini:0.1, rice:30, sesame_oil, soy', [
    '소고기, 당근, 애호박을 모두 5mm 크기로 잘게 다져요.',
    '냄비에 참기름 한 방울을 두르고 소고기를 익힌 뒤 채소를 넣어 1분쯤 함께 볶아요.',
    '지어 둔 진밥과 물을 넣고 저어 가며 퍼질 때까지 끓이고, 아기간장은 아주 조금만 넣어요.',
  ], S('https://www.10000recipe.com/recipe/6994883', '[유아식]소고기야채죽 진밥 활용 고소한 소고기죽 레시피', 6560)),
  R('baby-chicken-porridge', '아기 닭죽', 'bowl', B, '죽', 'chicken', ['chicken_breast'], 10, 'chicken_breast:30, onion:0.1, carrot:0.1, rice:30', [
    '닭가슴살, 양파, 당근을 모두 아주 잘게 다져요.',
    '냄비에 물과 다진 닭고기, 채소를 넣고 저어 가며 닭고기가 완전히 익을 때까지 끓여요.',
    '지어 둔 진밥을 넣고 밥알이 퍼질 때까지 저어 가며 끓여요.',
  ], S('https://www.10000recipe.com/recipe/6839774', '아기닭죽 만들기', 14000)),
  R('pumpkin-porridge', '단호박죽', 'bowl', B, '죽', 'none', ['pumpkin'], 15, 'pumpkin:0.2, rice:20', [
    '단호박은 전자레인지에 5분쯤 돌려 익힌 뒤 씨와 껍질을 걷어 내요.',
    '단호박에 같은 양의 물과 지어 둔 밥을 넣고 곱게 갈아요.',
    '냄비에 옮겨 약불에서 바닥이 눋지 않게 저어 가며 걸쭉해질 때까지 끓여요.',
  ], S('https://www.10000recipe.com/recipe/6985039', '단호박죽 만들기 ~ 아픈 21개월 아기를 위한 아기 단호박죽', 13000)),
  R('potato-oatmeal', '감자 오트밀', 'bowl', B, '죽', 'none', ['potato', 'oat'], 10, 'potato:0.5, oat:30, milk:50', [
    '감자는 껍질을 벗겨 작게 썰고 전자레인지용 찜기에 3분쯤 익혀요.',
    '익은 감자를 포크로 으깨고 오트밀과 우유를 넣어 골고루 섞어요.',
    '전자레인지에 1분 더 돌리고, 되직하면 우유를 조금 더 넣어요.',
  ], S('https://www.10000recipe.com/recipe/7014255', '유아 간단 아침 오트밀레시피 "감자 오트밀"', 3123)),
  R('egg-fried-rice', '달걀볶음밥', 'bowl', BD, '볶음', 'egg', ['egg'], 10, 'egg:1, green_onion:0.1, rice:40, oil, soy, sesame_oil', [
    '대파 흰 부분을 잘게 썰어 기름을 살짝 두른 팬에 볶아 향을 내요.',
    '달걀을 풀어 넣고 부드럽게 저어 완전히 익을 때까지 스크램블해요.',
    '밥을 넣고 아기간장 아주 조금과 참기름 한 방울로 골고루 볶아요.',
  ], S('https://www.10000recipe.com/recipe/6993153', '[유아식]달걀볶음밥 아침메뉴 추천 달걀볶음밥', 8999)),
  R('beef-rice-ball', '소고기 주먹밥', 'bowl', BD, '주먹밥', 'beef', ['beef_mince'], 15, 'beef_mince:30, zucchini:0.1, carrot:0.1, rice:40, soy, sesame_oil', [
    '소고기는 핏물을 닦고 애호박, 당근과 함께 최대한 잘게 다져요.',
    '팬에 채소와 소고기를 넣고 아기간장 아주 조금으로 뭉치지 않게 바짝 익혀요.',
    '밥에 볶은 재료와 참기름 한 방울을 섞어 한입 크기로 동글게 뭉쳐요.',
  ], S('https://www.10000recipe.com/recipe/7042060', '두돌 아기 소고기 주먹밥 만들기 한그릇 유아식 식단', 6978)),
  R('cheese-ball-rice', '치즈볼 주먹밥', 'bowl', B, '주먹밥', 'none', ['cheese'], 15, 'cheese:1, potato:0.3, carrot:0.1, rice:40, oil', [
    '감자는 작게 썰어 전자레인지에 익힌 뒤 으깨고, 당근은 잘게 다져 기름을 살짝 두른 팬에 볶아요.',
    '밥에 으깬 감자와 당근을 넣고 고루 섞어요.',
    '아기치즈를 작게 잘라 밥 가운데에 넣고 한입 크기로 동글게 뭉쳐요.',
  ], S('https://www.10000recipe.com/recipe/6899188', '[완료기이유식] 치즈볼주먹밥', 39000)),
  R('beef-veggie-fried-rice', '소고기 채소 볶음밥', 'bowl', BD, '볶음', 'beef', ['beef_mince'], 15, 'beef_mince:30, onion:0.1, carrot:0.1, rice:40, sesame_oil', [
    '양파와 당근을 5mm 크기로 곱게 다져요.',
    '팬에 참기름 한 방울을 두르고 소고기를 먼저 익힌 뒤 채소를 넣어 중약불로 볶아요.',
    '밥을 넣고 고루 볶아요. 간은 따로 하지 않아도 돼요.',
  ], S('https://www.10000recipe.com/recipe/6897531', '유아 소고기 야채 볶음밥 만들기', 44000)),
  R('steamed-egg-rice', '계란찜밥', 'bowl', B, '찜', 'egg', ['egg'], 10, 'egg:1, zucchini:0.1, carrot:0.1, rice:20, sesame_oil, sesame', [
    '애호박과 당근을 아주 잘게 다져 전자레인지용 그릇에 담아요.',
    '계란과 같은 양의 물, 밥 조금, 참기름 한 방울과 곱게 간 깨를 넣고 잘 저어요.',
    '랩을 씌워 구멍을 내고 전자레인지에 4~5분 돌려 속까지 완전히 익혀요.',
  ], S('https://www.10000recipe.com/recipe/7000751', '유아식 입 짧은 아기가 완밥한 계란찜밥', 7777)),
  R('potato-fried-rice', '감자 볶음밥', 'bowl', BD, '볶음', 'none', ['potato'], 15, 'potato:0.3, onion:0.1, carrot:0.1, rice:40, oil, soy', [
    '감자는 작게 깍둑썰어 물에 헹구고, 양파와 당근은 잘게 다져요.',
    '기름을 살짝 두른 팬에 감자를 먼저 볶다가 채소를 넣고 물을 조금 부어 부드럽게 익혀요.',
    '밥을 넣고 아기간장 아주 조금으로 간해 고루 볶아요.',
  ], S('https://www.10000recipe.com/recipe/7041718', '아기 감자 볶음밥 만드는법 간단 유아식 레시피', 1676)),
  R('beef-tofu-rice-bowl', '소고기 두부덮밥', 'bowl', D, '덮밥', 'beef', ['beef_mince', 'tofu'], 15, 'beef_mince:25, tofu:0.2, onion:0.1, rice:40, oil, soy, starch', [
    '두부는 작게 깍둑썰고 양파는 잘게 다져요.',
    '기름을 살짝 두른 팬에 소고기와 양파를 볶다가 물과 아기간장 아주 조금, 두부를 넣고 끓여요.',
    '전분물로 살짝 걸쭉하게 만들어 밥 위에 올려요.',
  ], S('https://www.10000recipe.com/recipe/6991791', '아기 밥, 소고기두부덮밥 레시피', 4126)),
  R('baby-janchi-noodle', '아기 잔치국수', 'bowl', D, '면', 'egg', ['noodle', 'egg'], 15, 'noodle:40, egg:1, zucchini:0.1', [
    '애호박은 가늘게 채 썰어 끓는 물에 5분쯤 익혀 국물을 만들어요.',
    '국수는 따로 푹 삶아 찬물에 헹구고 먹기 좋게 짧게 잘라요.',
    '국물에 국수를 넣고 계란 노른자를 풀어 넣어 완전히 익혀요.',
  ], S('https://www.10000recipe.com/recipe/6970063', '아기잔치국수 레시피', 20000)),
  R('mild-baby-curry', '순한 아기카레', 'bowl', D, '덮밥', 'chicken', ['curry', 'chicken_breast'], 15, 'curry:10, chicken_breast:30, potato:0.3, rice:40', [
    '닭가슴살과 감자를 5mm 크기로 작게 썰어요.',
    '냄비에 물과 닭고기, 감자를 넣고 감자가 부드러워질 때까지 끓여요.',
    '아기 카레가루를 풀어 저어 가며 걸쭉하게 끓인 뒤 밥 위에 올려요.',
  ], S('https://www.10000recipe.com/recipe/6847255', '백주부 스타일의 순한 아기카레 만들기', 15000)),

  // ---- rice (3) ----
  R('plain-rice', '흰 쌀밥', 'rice', D, '밥', 'none', [], 5, 'rice:40', [
    '쌀을 깨끗이 씻어 밥솥에 안쳐요.',
    '아이가 먹기 좋게 물을 평소보다 조금 넉넉히 넣어 지어요.',
  ], { everyday: true }),
  R('sweet-potato-rice', '고구마밥', 'rice', D, '밥', 'none', ['sweet_potato'], 10, 'sweet_potato:0.3, rice:40', [
    '고구마는 껍질을 벗겨 숟가락에 들어갈 크기로 깍둑썰어요.',
    '씻은 쌀 위에 고구마를 올리고 평소 물양으로 밥솥에 취사해요.',
    '다 되면 고구마가 뭉개지지 않게 살살 섞어요.',
  ], S('https://www.10000recipe.com/recipe/7013178', '쿠쿠 전기밥솥 고구마밥과 양념장 만들기 (유아식 고구마밥)', 3669)),
  R('radish-rice', '무밥', 'rice', D, '밥', 'none', ['radish'], 10, 'radish:0.1, rice:40', [
    '쌀은 씻어서 20분쯤 불려요(불리는 시간 제외).',
    '무는 얇게 썬 뒤 가늘게 채 썰어요.',
    '불린 쌀 위에 무를 펴 올리고 물을 조금 적게 잡아 밥솥에 취사해요.',
  ], S('https://www.10000recipe.com/recipe/7018322', '아기 무밥 간장 양념장 만드는법 제철 유아식', 2077)),

  // ---- soup (9) ----
  R('bean-sprout-soup', '콩나물국', 'soup', D, '국', 'none', ['bean_sprout'], 10, 'bean_sprout:0.2, green_onion:0.1, soy', [
    '콩나물은 씻어서 아이가 먹기 좋게 짧게 자르고, 대파는 잘게 썰어요.',
    '물이 끓으면 콩나물을 넣고 뚜껑을 연 채로 그대로 끓여요.',
    '아기간장 아주 조금과 대파를 넣고 한소끔 더 끓여요.',
  ], S('https://www.10000recipe.com/recipe/7042856', '아기 콩나물국 끓이는법 레시피 유아식 국 종류', 6265)),
  R('beef-miyeok-soup', '소고기 미역국', 'soup', D, '국', 'beef', ['beef_stew', 'miyeok'], 15, 'beef_stew:30, miyeok:0.05, sesame_oil, soy', [
    '건미역은 10분쯤 불려(불리는 시간 제외) 헹군 뒤 짧게 자르고, 소고기는 잘게 썰어요.',
    '냄비에 참기름 한 방울로 소고기를 바짝 익힌 뒤 미역을 넣고 함께 볶아요.',
    '물을 붓고 끓이다가 아기간장을 아주 조금만 넣어요.',
  ], S('https://www.10000recipe.com/recipe/7030032', '돌아기 소고기 미역국 유아식 국 끓이기', 10000)),
  R('beef-radish-soup', '소고기 무국', 'soup', D, '국', 'beef', ['beef_stew', 'radish'], 15, 'beef_stew:30, radish:0.1, sesame_oil, soy', [
    '소고기는 잘게 썰고 무는 빨리 익게 얇고 작게 썰어요.',
    '냄비에 참기름 한 방울로 소고기를 볶다가 무를 넣고 투명해질 때까지 볶아요.',
    '물을 붓고 끓이며 거품을 걷어 내고, 아기간장을 아주 조금만 넣어요.',
  ], S('https://www.10000recipe.com/recipe/6839252', '아기반찬 소고기무국 만들기', 19000)),
  R('potato-egg-soup', '감자 계란국', 'soup', D, '국', 'egg', ['egg', 'potato'], 15, 'potato:0.3, egg:0.5, soy, sesame', [
    '감자는 껍질을 벗겨 아기 한입 크기로 얇게 썰고, 계란은 풀어 둬요.',
    '물에 감자와 아기간장 아주 조금을 넣고 감자가 익을 때까지 끓여요.',
    '계란을 천천히 부으며 저어 완전히 익히고, 곱게 간 깨를 조금 넣어 한소끔 더 끓여요.',
  ], S('https://www.10000recipe.com/recipe/6976969', '[아기식단/아기국] "홍양갱의 밤 - 초간단 감자계란국"', 6298)),
  R('enoki-doenjang-soup', '팽이버섯 된장국', 'soup', D, '국', 'none', ['enoki', 'doenjang'], 10, 'enoki:0.3, green_onion:0.1, doenjang', [
    '팽이버섯은 밑동을 자르고 짧게 4등분하고, 대파도 비슷한 길이로 썰어요.',
    '물이 끓으면 된장을 아주 조금만 체에 걸러 풀어요.',
    '팽이버섯과 대파를 넣고 뚜껑을 덮어 한소끔 끓여요.',
  ], S('https://www.10000recipe.com/recipe/6943494', '(아기 국 반찬) 팽이버섯 된장국', 19000)),
  R('tofu-potato-soup', '두부 감자국', 'soup', D, '국', 'tofu', ['tofu', 'potato'], 15, 'tofu:0.2, potato:0.3, soy', [
    '감자는 한입 크기로 얇게 썰어 헹구고, 두부도 작게 썰어요.',
    '물에 감자를 넣고 아기간장 아주 조금으로 간해 살짝 투명해질 때까지 끓여요.',
    '두부를 넣고 두부가 떠오를 때까지 끓여요.',
  ], S('https://www.10000recipe.com/recipe/6961515', '두부감자국~유아/어린이국!', 22000)),
  R('spinach-doenjang-soup', '시금치 된장국', 'soup', D, '국', 'none', ['spinach', 'doenjang'], 10, 'spinach:0.1, onion:0.1, doenjang', [
    '시금치는 끓는 물에 30초 데쳐 짧게 썰고, 양파는 잘게 썰어요.',
    '물에 된장을 아주 조금만 풀어 끓여요.',
    '시금치와 양파를 넣고 한소끔 끓여요.',
  ], S('https://www.10000recipe.com/recipe/6950910', '아기 시금치된장국 넣고 끓이기만 하면 끝!', 11000)),
  R('pollack-soup', '황태국', 'soup', D, '국', 'fish', ['pollack'], 15, 'pollack:10, radish:0.1, sesame_oil, soy', [
    '황태채는 가볍게 씻어 물기를 짜고, 가시를 골라낸 뒤 가위로 잘게 잘라요. 무는 작고 얇게 썰어요.',
    '냄비에 참기름 한 방울을 두르고 황태채와 무를 함께 볶아요.',
    '물을 붓고 무가 익을 때까지 끓이다가 아기간장을 아주 조금만 넣어요.',
  ], S('https://www.10000recipe.com/recipe/6993640', '[유아식]뜨끈한 황태국 아기 국요리', 6497)),
  R('clear-cod-soup', '맑은 대구탕', 'soup', D, '국', 'fish', ['cod', 'radish'], 15, 'cod:40, radish:0.1, soy', [
    '무는 얇게 나박썰기하고, 대구살은 가시를 꼼꼼히 확인해 작게 썰어요.',
    '냄비에 물, 무, 대구살을 넣고 중약불에서 10분쯤 끓이며 거품을 걷어 내요.',
    '아기간장을 아주 조금만 넣고 한소끔 더 끓여요.',
  ], S('https://www.10000recipe.com/recipe/6991503', '[유아식] 아기 보양식 메뉴 맑은대구탕 만들기', 5182)),

  // ---- side (14) ----
  R('mackerel-radish-braise', '고등어 무조림', 'side', D, '조림', 'fish', ['mackerel', 'radish'], 15, 'mackerel:40, radish:0.1, sesame_oil, soy', [
    '무는 얇게 나박썰기하고, 순살 고등어는 가시를 꼼꼼히 확인해 한입 크기로 잘라요.',
    '팬에 참기름 한 방울을 두르고 무를 볶다가, 반투명해지면 물을 조금 붓고 고등어와 아기간장 아주 조금을 넣어요.',
    '약불에서 고등어가 속까지 익고 국물이 졸아들 때까지 조려요.',
  ], S('https://www.10000recipe.com/recipe/7001360', '담백하게 맛있는 아기고등어 조림 만들기', 1740)),
  R('steamed-egg', '계란찜', 'side', D, '찜', 'egg', ['egg'], 10, 'egg:1, sesame_oil', [
    '계란 1개를 잘 풀고 물 100ml를 넣어 고루 섞어요.',
    '그릇에 담아 김이 오른 찜기에 7~8분 쪄서 속까지 완전히 익혀요.',
    '참기름을 한 방울만 둘러 마무리해요.',
  ], S('https://www.10000recipe.com/recipe/7019681', '아기계란찜 극강의 부드러움 부들부들 계란찜레시피', 2961)),
  R('grilled-salmon', '연어구이', 'side', D, '구이', 'fish', ['salmon'], 15, 'salmon:40, oil', [
    '연어는 물에 한 번 헹궈 물기를 닦고 가시를 꼼꼼히 확인해요.',
    '기름을 살짝 두른 팬에 올려 바닥이 노릇해지면 뒤집어 속까지 익혀요.',
    '한입 크기로 잘게 찢어서 줘요.',
  ], S('https://www.10000recipe.com/recipe/6992330', '[유아식]아기 연어요리 담백한 연어구이', 8797)),
  R('soft-tofu-egg-roll', '순두부 달걀말이', 'side', D, '부침', 'egg', ['egg', 'soft_tofu'], 15, 'egg:2, soft_tofu:0.3, soy, oil', [
    '달걀을 곱게 풀고 순두부와 아기간장 아주 조금을 넣어 섞어요.',
    '기름을 두른 팬에 약불로 반죽을 얇게 부어 바닥이 익으면 돌돌 말아요.',
    '남은 반죽을 나눠 부어 가며 같은 방법으로 말고, 식으면 한입 크기로 썰어요.',
  ], S('https://www.10000recipe.com/recipe/6953924', '(아기반찬) 순두부 달걀말이', 52000)),
  R('tofu-buchim', '두부부침', 'side', D, '부침', 'tofu', ['tofu', 'egg'], 10, 'tofu:0.25, egg:1, oil', [
    '두부는 한입 크기로 썰어 물기를 닦아요.',
    '계란을 곱게 풀어 두부에 골고루 입혀요.',
    '기름을 두른 팬에 약불로 두부를 하나씩 올려 앞뒤로 계란까지 완전히 익혀요.',
  ], S('https://www.10000recipe.com/recipe/6871776', '아빠도 할수있는 두부 부침 (17개월 유아식)', 24000)),
  R('tofu-jorim', '두부조림', 'side', D, '조림', 'tofu', ['tofu'], 15, 'tofu:0.2, starch, oil, soy', [
    '두부는 한입 크기로 썰어 물기를 닦고 전분을 얇게 묻혀요.',
    '기름을 두른 팬에 앞뒤로 노릇하게 구워요.',
    '아기간장 아주 조금과 물을 섞어 붓고 앞뒤로 한 번씩 더 조려요.',
  ], S('https://www.10000recipe.com/recipe/6989515', '[유아식] 아기 두부요리, 두부조림', 10000)),
  R('spinach-tofu-namul', '시금치 두부무침', 'side', D, '무침', 'tofu', ['spinach', 'tofu'], 10, 'spinach:0.2, tofu:0.2, sesame_oil, sesame', [
    '시금치 잎과 두부를 끓는 물에 살짝 데쳐요.',
    '시금치는 물기를 꼭 짜서 잘게 썰고, 두부는 물기를 빼고 으깨요.',
    '참기름 한 방울과 곱게 간 깨를 넣고 조물조물 무쳐요.',
  ], S('https://www.10000recipe.com/recipe/4575580', '아기반찬-시금치두부무침', 60000)),
  R('bean-sprout-namul', '콩나물무침', 'side', D, '무침', 'none', ['bean_sprout'], 10, 'bean_sprout:0.2, soy, sesame_oil, sesame', [
    '콩나물은 뿌리를 떼고 4등분으로 짧게 잘라 씻어요.',
    '끓는 물에 뚜껑을 연 채 3분 데친 뒤 건져서 식혀요.',
    '아기간장 아주 조금, 참기름 한 방울, 곱게 간 깨를 넣고 버무려요.',
  ], S('https://www.10000recipe.com/recipe/6943003', '(아기반찬) 콩나물 무침', 30000)),
  R('zucchini-dried-shrimp-saute', '애호박 밥새우볶음', 'side', D, '볶음', 'fish', ['zucchini', 'dried_shrimp'], 15, 'zucchini:0.3, dried_shrimp:5, sesame_oil, soy', [
    '애호박은 0.3cm 두께로 썰어 4등분해요.',
    '팬에 참기름 한 방울을 두르고 밥새우를 약불에 볶다가 애호박을 넣어 같이 볶아요.',
    '물을 조금 붓고 뚜껑을 덮어 애호박 속까지 익힌 뒤, 물이 졸면 아기간장을 아주 조금만 넣어 섞어요.',
  ], S('https://www.10000recipe.com/recipe/6942054', '(아기반찬) 애호박 밥새우 볶음', 20000)),
  R('potato-saute', '감자볶음', 'side', D, '볶음', 'none', ['potato'], 12, 'potato:0.5, carrot:0.1, oil', [
    '감자와 당근은 가늘게 채 썰고, 감자는 물에 한 번 헹궈 전분기를 빼요.',
    '기름을 살짝 두른 팬에 감자와 당근을 넣고 물을 2~3숟가락 부어요.',
    '뚜껑을 덮고 약불에서 가끔 뒤적이며 감자가 부드러워질 때까지 7~8분 익혀요.',
  ], S('https://www.10000recipe.com/recipe/6954761', '(아기반찬) 감자볶음 레시피', 13000)),
  R('beef-soboro', '소고기 소보로', 'side', D, '볶음', 'beef', ['beef_mince'], 15, 'beef_mince:40, carrot:0.1, soy, sesame_oil', [
    '당근은 아주 잘게 다지고, 팬에 물을 조금씩 넣어 가며 부드럽게 볶아 덜어 둬요.',
    '같은 팬에 소고기를 보슬보슬하게 볶으며 아기간장을 아주 조금만 넣어요.',
    '국물이 살짝 남았을 때 당근을 넣어 섞고 참기름 한 방울로 마무리해요.',
  ], S('https://www.10000recipe.com/recipe/6947833', '만능 아기반찬 소고기소보로', 31000)),
  R('potato-broccoli-braise', '감자 브로콜리조림', 'side', D, '조림', 'none', ['potato', 'broccoli'], 15, 'potato:0.3, broccoli:0.2, soy', [
    '감자와 브로콜리 송이를 한입 크기로 작게 잘라요.',
    '냄비에 감자와 물을 넣고 익히다가 거의 익으면 브로콜리를 넣어요.',
    '아기간장을 아주 조금만 넣고 물기가 날아갈 때까지 재빨리 조려요.',
  ], S('https://www.10000recipe.com/recipe/4690673', '아기반찬-감자브로콜리조림', 51000)),
  R('anchovy-stirfry', '멸치볶음', 'side', D, '볶음', 'fish', ['anchovy'], 10, 'anchovy:10, oil, soy, sesame_oil', [
    '잔멸치를 마른 팬에 볶아 비린 맛을 날리고 체에 털어 부스러기를 빼요.',
    '팬에 기름을 살짝 두르고 멸치를 넣어 골고루 섞어요.',
    '불을 줄이고 아기간장 아주 조금과 참기름 한 방울을 넣어 타지 않게 살짝 볶아요.',
  ], S('https://www.10000recipe.com/recipe/6946475', '[아기반찬] 국민반찬! 아기 멸치볶음 황금레시피', 86000)),
  R('flatfish-radish-braise', '가자미 무조림', 'side', D, '조림', 'fish', ['flatfish', 'radish'], 15, 'flatfish:40, radish:0.1, soy', [
    '무는 얇게 썰고, 가자미살은 씻어서 남은 가시가 없는지 꼼꼼히 확인한 뒤 한입 크기로 잘라요.',
    '냄비에 무를 깔고 가자미살을 올린 뒤 물을 자작하게 붓고 아기간장을 아주 조금만 넣어요.',
    '뚜껑을 덮고 중약불에서 무가 익을 때까지 10분쯤 조려요.',
  ], S('https://www.10000recipe.com/recipe/6993368', '[유아식]간장 가자미무조림 만들기', 6401)),
];
