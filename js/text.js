export function titleFor(name) {
  const n = (name ?? '').trim();
  if (!n) return '우리 아기 식탁';
  const code = n.charCodeAt(n.length - 1);
  const hangul = code >= 0xac00 && code <= 0xd7a3;
  return hangul && (code - 0xac00) % 28 !== 0 ? `${n}이 식탁` : `${n} 식탁`;
}

// 조회수 표시: 1만 이상은 "1.3만"(소수 한 자리, .0 생략), 그 미만은 "3,669"
export function formatViews(n) {
  if (n >= 10000) return `${Math.round(n / 1000) / 10}만`;
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
