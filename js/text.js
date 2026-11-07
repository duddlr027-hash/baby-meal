export function titleFor(name) {
  const n = (name ?? '').trim();
  if (!n) return '우리 아기 식탁';
  const code = n.charCodeAt(n.length - 1);
  const hangul = code >= 0xac00 && code <= 0xd7a3;
  return hangul && (code - 0xac00) % 28 !== 0 ? `${n}이 식탁` : `${n} 식탁`;
}
