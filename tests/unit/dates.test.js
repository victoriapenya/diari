import { describe, it, expect } from 'vitest';
import {
  today,
  isValidDay,
  addDays,
  previousDay,
  nextDay,
  isFuture,
  isOpenable,
  formatLong,
  formatTime,
  dayFromHash,
  hashForDay,
} from '../../src/lib/dates.js';

// Fixed "now": 20 October 2026, 15:30 local time.
const NOW = new Date(2026, 9, 20, 15, 30);

describe('E1-H1 today', () => {
  it('returns the local date as YYYY-MM-DD', () => {
    expect(today(NOW)).toBe('2026-10-20');
  });

  it('uses local time just before midnight', () => {
    expect(today(new Date(2026, 9, 20, 23, 59))).toBe('2026-10-20');
  });

  it('pads single-digit months and days', () => {
    expect(today(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('E1-H1 formatLong', () => {
  it('formats a day in long Catalan form', () => {
    expect(formatLong('2026-10-20')).toBe('dimarts, 20 d’octubre del 2026');
  });

  it('uses "de" before consonant months', () => {
    expect(formatLong('2026-03-05')).toBe('dijous, 5 de març del 2026');
  });
});

describe('E1-H2 isValidDay', () => {
  it('accepts well-formed days', () => {
    expect(isValidDay('2026-10-20')).toBe(true);
    expect(isValidDay('2024-02-29')).toBe(true);
  });

  it('rejects malformed or impossible days', () => {
    expect(isValidDay('2026-02-30')).toBe(false);
    expect(isValidDay('2025-02-29')).toBe(false);
    expect(isValidDay('2026-13-01')).toBe(false);
    expect(isValidDay('2026-1-5')).toBe(false);
    expect(isValidDay('hola')).toBe(false);
    expect(isValidDay('')).toBe(false);
    expect(isValidDay(undefined)).toBe(false);
  });
});

describe('E1-H2 previous and next day', () => {
  it('moves one day back and forward', () => {
    expect(previousDay('2026-10-20')).toBe('2026-10-19');
    expect(nextDay('2026-10-20')).toBe('2026-10-21');
  });

  it('crosses month and year boundaries', () => {
    expect(previousDay('2026-03-01')).toBe('2026-02-28');
    expect(nextDay('2026-12-31')).toBe('2027-01-01');
    expect(previousDay('2026-01-01')).toBe('2025-12-31');
  });

  it('is not affected by daylight saving changes', () => {
    // 25 October 2026 is the end of DST in Europe.
    expect(addDays('2026-10-24', 2)).toBe('2026-10-26');
    expect(addDays('2026-03-28', 2)).toBe('2026-03-30');
  });
});

describe('E1-H2 future days are blocked', () => {
  it('detects future days', () => {
    expect(isFuture('2026-10-21', NOW)).toBe(true);
    expect(isFuture('2027-01-01', NOW)).toBe(true);
  });

  it('treats today and past days as not future', () => {
    expect(isFuture('2026-10-20', NOW)).toBe(false);
    expect(isFuture('2020-01-01', NOW)).toBe(false);
  });

  it('only opens valid, non-future days', () => {
    expect(isOpenable('2026-10-20', NOW)).toBe(true);
    expect(isOpenable('2026-10-19', NOW)).toBe(true);
    expect(isOpenable('2026-10-21', NOW)).toBe(false);
    expect(isOpenable('2026-02-30', NOW)).toBe(false);
  });
});

describe('E1-H2 URL hash', () => {
  it('reads a past day from the hash', () => {
    expect(dayFromHash('#/2026-10-01', NOW)).toBe('2026-10-01');
  });

  it('falls back to today for empty, invalid or future hashes', () => {
    expect(dayFromHash('', NOW)).toBe('2026-10-20');
    expect(dayFromHash('#/', NOW)).toBe('2026-10-20');
    expect(dayFromHash('#/patata', NOW)).toBe('2026-10-20');
    expect(dayFromHash('#/2026-10-21', NOW)).toBe('2026-10-20');
    expect(dayFromHash('#/2099-01-01', NOW)).toBe('2026-10-20');
  });

  it('builds a hash for a day', () => {
    expect(hashForDay('2026-10-20')).toBe('#/2026-10-20');
  });
});

describe('E1-H3 formatTime', () => {
  it('formats a timestamp as local HH:MM', () => {
    expect(formatTime(new Date(2026, 9, 20, 9, 5).toISOString())).toBe('09:05');
    expect(formatTime(new Date(2026, 9, 20, 23, 59).toISOString())).toBe('23:59');
  });
});
