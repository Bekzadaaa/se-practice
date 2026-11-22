import { describe, it, expect } from 'vitest';
import { canBook } from './booking';

// Default fixture from the reviewed case table:
// now = 540 (09:00), room not blocked, one existing booking 600–660 (10:00–11:00).
const NOW = 540;
const bookings = [{ start: 600, end: 660 }];

function request(start: number, end: number, overrides: Partial<Parameters<typeof canBook>[0]> = {}) {
  return { start, end, now: NOW, blocked: false, bookings, ...overrides };
}

describe('canBook — AC1 interval and current time', () => {
  it('T02 AC1: rejects a request that starts exactly at the current time (540–570)', () => {
    expect(canBook(request(540, 570))).toBe(false);
  });

  it('T03 AC1: rejects a zero-duration interval (720–720)', () => {
    expect(canBook(request(720, 720))).toBe(false);
  });

  it('T04 AC1: rejects a reversed interval (750–720)', () => {
    expect(canBook(request(750, 720))).toBe(false);
  });

  it('T05 AC1: rejects an interval that ends after 24:00 (1380–1441)', () => {
    expect(canBook(request(1380, 1441))).toBe(false);
  });

  it('X1 AC1: accepts an interval that ends exactly at 24:00 (1380–1440)', () => {
    expect(canBook(request(1380, 1440))).toBe(true);
  });
});

describe('canBook — AC2 maximum duration', () => {
  it('T06 AC2: accepts exactly 120 minutes (720–840)', () => {
    expect(canBook(request(720, 840))).toBe(true);
  });

  it('T07 AC2: rejects 121 minutes (720–841)', () => {
    expect(canBook(request(720, 841))).toBe(false);
  });
});

describe('canBook — AC3 blocked room', () => {
  it('T13 AC3: rejects a blocked room even for a free slot (660–720)', () => {
    expect(canBook(request(660, 720, { blocked: true }))).toBe(false);
  });
});

describe('canBook — AC4 overlaps and touching endpoints', () => {
  it('T01 AC4: accepts a request touching the end of a booking (660–720)', () => {
    expect(canBook(request(660, 720))).toBe(true);
  });

  it('T08 AC4: accepts a request touching the start of a booking (570–600)', () => {
    expect(canBook(request(570, 600))).toBe(true);
  });

  it.each([
    ['T09', 630, 690, 'partial overlap'],
    ['T10', 570, 690, 'contains the booking'],
    ['T11', 615, 645, 'inside the booking'],
    ['T12', 600, 660, 'identical interval'],
  ])('%s AC4: rejects %i–%i (%s)', (_id, start, end) => {
    expect(canBook(request(start as number, end as number))).toBe(false);
  });

  it('T14 AC4: accepts 630–690 when there are no bookings', () => {
    expect(canBook(request(630, 690, { bookings: [] }))).toBe(true);
  });

  it('X2 AC4: accepts a request that touches two bookings (660–720 between 600–660 and 720–780)', () => {
    const twoBookings = [
      { start: 600, end: 660 },
      { start: 720, end: 780 },
    ];
    expect(canBook(request(660, 720, { bookings: twoBookings }))).toBe(true);
  });
});

describe('canBook — AC5 booking data is not changed', () => {
  it('AC5: an Available check leaves the bookings unchanged', () => {
    const before = structuredClone(bookings);
    const result = canBook(request(660, 720));
    expect(result).toBe(true);
    expect(bookings).toEqual(before);
  });
});
