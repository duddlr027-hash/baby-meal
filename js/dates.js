const pad = (n) => String(n).padStart(2, '0');
const DOW = ['일', '월', '화', '수', '목', '금', '토'];

export function toISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseISO(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function weekStart(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dow = d.getDay();
  d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
  return toISO(d);
}

export function addDays(iso, n) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

const md = (d) => `${d.getMonth() + 1}/${d.getDate()}`;

export function weekLabel(mondayIso) {
  return `${md(parseISO(mondayIso))} – ${md(parseISO(addDays(mondayIso, 6)))}`;
}

export function dayLabel(mondayIso, i) {
  const d = parseISO(addDays(mondayIso, i));
  return `${md(d)} (${DOW[d.getDay()]})`;
}

export function ageInMonths(birthIso, today) {
  const b = parseISO(birthIso);
  let m = (today.getFullYear() - b.getFullYear()) * 12 + (today.getMonth() - b.getMonth());
  if (today.getDate() < b.getDate()) m -= 1;
  return Math.max(0, m);
}
