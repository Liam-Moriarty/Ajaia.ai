import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatUpdatedAt } from './formatUpdatedAt';

describe('formatUpdatedAt', () => {
  const now = new Date('2026-09-06T12:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a time for updates earlier today', () => {
    const today = new Date('2026-09-06T09:30:00.000Z').toISOString();

    expect(formatUpdatedAt(today)).toMatch(/^Updated \d{1,2}:\d{2}/);
  });

  it('shows a time for updates later today, even if in the future', () => {
    const laterToday = new Date('2026-09-06T18:00:00.000Z').toISOString();

    expect(formatUpdatedAt(laterToday)).toMatch(/^Updated \d{1,2}:\d{2}/);
  });

  it('says "yesterday" for exactly one day ago', () => {
    const yesterday = new Date('2026-09-05T12:00:00.000Z').toISOString();

    expect(formatUpdatedAt(yesterday)).toBe('Updated yesterday');
  });

  it('reports days ago for 2-6 days in the past', () => {
    const threeDaysAgo = new Date('2026-09-03T12:00:00.000Z').toISOString();

    expect(formatUpdatedAt(threeDaysAgo)).toBe('Updated 3 days ago');
  });

  it('falls back to a short date for a week or more in the past', () => {
    const eightDaysAgo = new Date('2026-08-29T12:00:00.000Z').toISOString();

    expect(formatUpdatedAt(eightDaysAgo)).toMatch(
      /^Updated [A-Z][a-z]{2} \d{1,2}$/
    );
  });
});
