import { describe, test, expect } from 'vitest';
import { canBook } from './booking';

// Default fixture (plan, section 6): now = 540 (09:00), not blocked, one booking 600–660.
// Every test builds its own request and its own bookings array: nothing is shared between tests.
type Booking = { start: number; end: number };

function defaultBookings(): Booking[] {
  return [{ start: 600, end: 660 }];
}

function check(start: number, end: number, blocked = false, bookings: Booking[] = defaultBookings()): boolean {
  return canBook({ start, end, now: 540, blocked, bookings });
}

describe('AC1 — 0 ≤ start < end ≤ 1440 and start after now', () => {
  test('T02 AC1: 540–570 starts exactly at the current time → Unavailable', () => {
    expect(check(540, 570)).toBe(false);
  });

  test('T03 AC1: 720–720 has zero duration → Unavailable', () => {
    expect(check(720, 720)).toBe(false);
  });

  test('T04 AC1: 750–720 is reversed → Unavailable', () => {
    expect(check(750, 720)).toBe(false);
  });

  test('T05 AC1: 1380–1441 ends after 24:00 → Unavailable', () => {
    expect(check(1380, 1441)).toBe(false);
  });

  test('X1 AC1: 1380–1440 ends exactly at 24:00 → Available', () => {
    expect(check(1380, 1440)).toBe(true);
  });

  test('AC1 boundary: 541–600 starts one minute after now → Available', () => {
    expect(check(541, 600)).toBe(true);
  });
});

describe('AC2 — at most 120 minutes', () => {
  test('T06 AC2: 720–840 is exactly 120 minutes → Available', () => {
    expect(check(720, 840)).toBe(true);
  });

  test('T07 AC2: 720–841 is 121 minutes → Unavailable', () => {
    expect(check(720, 841)).toBe(false);
  });
});

describe('AC3 — blocked room', () => {
  test('T13 AC3: 660–720 in a blocked room → Unavailable', () => {
    expect(check(660, 720, true)).toBe(false);
  });
});

describe('AC4 — overlaps rejected, touching allowed', () => {
  test('T01 AC4: 660–720 touches the end of 600–660 → Available', () => {
    expect(check(660, 720)).toBe(true);
  });

  test('T08 AC4: 570–600 touches the start of 600–660 → Available', () => {
    expect(check(570, 600)).toBe(true);
  });

  test('T09 AC4: 630–690 partially overlaps 600–660 → Unavailable', () => {
    expect(check(630, 690)).toBe(false);
  });

  test('T10 AC4: 570–690 contains 600–660 → Unavailable', () => {
    expect(check(570, 690)).toBe(false);
  });

  test('T11 AC4: 615–645 lies inside 600–660 → Unavailable', () => {
    expect(check(615, 645)).toBe(false);
  });

  test('T12 AC4: 600–660 is identical to the booking → Unavailable', () => {
    expect(check(600, 660)).toBe(false);
  });

  test('T14 AC4: 630–690 with bookings = [] → Available', () => {
    expect(check(630, 690, false, [])).toBe(true);
  });

  test('X2 AC4: 660–720 touches 600–660 and 720–780 at once → Available', () => {
    expect(check(660, 720, false, [{ start: 600, end: 660 }, { start: 720, end: 780 }])).toBe(true);
  });

  test('AC4 boundary: 659–720 shares one minute (659) with 600–660 → Unavailable', () => {
    expect(check(659, 720)).toBe(false);
  });
});

describe('AC5 — checking does not change the booking data', () => {
  test('AC5: an Available check (660–720) leaves the bookings exactly as before', () => {
    const bookings = defaultBookings();
    const before = JSON.stringify(bookings);
    expect(canBook({ start: 660, end: 720, now: 540, blocked: false, bookings })).toBe(true);
    expect(JSON.stringify(bookings)).toBe(before);
    expect(bookings).toEqual([{ start: 600, end: 660 }]);
  });
});
