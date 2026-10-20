// A "day" is a local-time calendar date string: YYYY-MM-DD.

const DAY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (n) => String(n).padStart(2, '0');

function toDay(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toDate(day) {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function today(now = new Date()) {
  return toDay(now);
}

export function isValidDay(value) {
  if (typeof value !== 'string') return false;
  const match = DAY_RE.exec(value);
  if (!match) return false;
  // Round-trip rejects impossible dates such as 2026-02-30.
  return toDay(toDate(value)) === value;
}

export function addDays(day, n) {
  const date = toDate(day);
  date.setDate(date.getDate() + n);
  return toDay(date);
}

export function previousDay(day) {
  return addDays(day, -1);
}

export function nextDay(day) {
  return addDays(day, 1);
}

// YYYY-MM-DD strings compare correctly as plain strings.
export function isFuture(day, now = new Date()) {
  return day > today(now);
}

export function isOpenable(day, now = new Date()) {
  return isValidDay(day) && !isFuture(day, now);
}

const longFormatter = new Intl.DateTimeFormat('ca', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatLong(day) {
  return longFormatter.format(toDate(day));
}

export function formatTime(isoTimestamp) {
  const date = new Date(isoTimestamp);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Parses a location hash like "#/2026-10-20". Invalid or future days fall back to today.
export function dayFromHash(hash, now = new Date()) {
  const day = (hash ?? '').replace(/^#\/?/, '');
  return isOpenable(day, now) ? day : today(now);
}

export function hashForDay(day) {
  return `#/${day}`;
}
