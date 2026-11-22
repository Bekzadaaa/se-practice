import { describe, test, expect } from 'vitest';
import { filterRooms } from './filter';
import { checkRoom, explainRoom } from './booking';
import type { Room } from './rooms';

// A fixed catalog for the tests only — never the page's ROOMS, so a change to the demo data
// cannot change a result. Expected values come from F1–F5, not from what the code returns.
function catalog(): Room[] {
  return [
    { id: 'r1', name: 'Room 1', capacity: 8, equipment: ['whiteboard'], blocked: false, bookings: [] },
    { id: 'r2', name: 'Room 2', capacity: 20, equipment: ['projector'], blocked: false, bookings: [{ start: 600, end: 660 }] },
    { id: 'r3', name: 'Room 3', capacity: 20, equipment: ['projector', 'whiteboard'], blocked: false, bookings: [] },
    { id: 'r4', name: 'Room 4', capacity: 40, equipment: ['projector', 'whiteboard', 'computers'], blocked: true, bookings: [] },
  ];
}
const ids = (rooms: Room[]) => rooms.map((r) => r.id);

describe('filterRooms — F1 capacity, F2 equipment, F4 empty', () => {
  test('F1: 15 attendees keeps only rooms with capacity >= 15', () => {
    expect(ids(filterRooms(catalog(), { attendees: 15, equipment: [] }))).toEqual(['r2', 'r3', 'r4']);
  });

  test('B5 F1: capacity exactly equal to attendees (20 for 20) is included', () => {
    expect(ids(filterRooms(catalog(), { attendees: 20, equipment: [] }))).toEqual(['r2', 'r3', 'r4']);
  });

  test('B6 F1: capacity one below attendees (20 for 21) is excluded', () => {
    expect(ids(filterRooms(catalog(), { attendees: 21, equipment: [] }))).toEqual(['r4']);
  });

  test('F2: projector + whiteboard needs ALL items — a room with only a projector is out', () => {
    expect(ids(filterRooms(catalog(), { attendees: 1, equipment: ['projector', 'whiteboard'] }))).toEqual(['r3', 'r4']);
  });

  test('F2: no equipment selected means no equipment requirement', () => {
    expect(ids(filterRooms(catalog(), { attendees: 1, equipment: [] }))).toEqual(['r1', 'r2', 'r3', 'r4']);
  });

  test('F4: nothing matches 50 attendees with computers — an empty list, not an error', () => {
    expect(filterRooms(catalog(), { attendees: 50, equipment: ['computers'] })).toEqual([]);
  });
});

describe('checkRoom — the chosen room decides (F3, F5, AC5)', () => {
  const at = (start: number, end: number) => ({ start, end, now: 540 });

  test('F3 AC3: a blocked room is never available, even for a free slot (r4, 720–780)', () => {
    expect(checkRoom(catalog(), 'r4', at(720, 780))).toBe(false);
  });

  test("F5: the same times use the chosen room's own bookings — r2 (booked 600–660) no, r3 yes", () => {
    const rooms = catalog();
    expect(checkRoom(rooms, 'r2', at(600, 660))).toBe(false);
    expect(checkRoom(rooms, 'r3', at(600, 660))).toBe(true);
  });

  test('an unknown room id is not available', () => {
    expect(checkRoom(catalog(), 'nope', at(720, 780))).toBe(false);
  });

  test('AC5: an Available checkRoom leaves the whole catalog unchanged', () => {
    const rooms = catalog();
    const before = JSON.stringify(rooms);
    expect(checkRoom(rooms, 'r2', at(660, 720))).toBe(true);
    expect(JSON.stringify(rooms)).toBe(before);
  });

  test('INT F1 F2 F3: filterRooms, then checkRoom on each room it returned', () => {
    const rooms = catalog();
    const matching = filterRooms(rooms, { attendees: 15, equipment: ['projector', 'whiteboard'] });
    const results = matching.map((r) => [r.id, checkRoom(rooms, r.id, at(600, 660))]);
    expect(results).toEqual([
      ['r3', true],
      ['r4', false],
    ]);
  });
});

describe('explainRoom — the reasons shown under the decision', () => {
  test('F3: a blocked room says why', () => {
    const r = explainRoom(catalog(), 'r4', { start: 720, end: 780, now: 540 });
    expect(r.reasons).toContain('This room is blocked.');
  });

  test('AC1 AC4: an Unavailable decision always comes with a reason, on a grid of requests and an unparseable time', () => {
    const rooms = catalog();
    const silent: string[] = [];
    const starts = [NaN, 480, 540, 570, 600, 630, 660, 700];
    for (const id of ['r1', 'r2', 'r4']) {
      for (const start of starts) {
        for (const end of [NaN, 540, 600, 660, 690, 720, 780, 800]) {
          const request = { start, end, now: 540 };
          const available = checkRoom(rooms, id, request);
          const explained = explainRoom(rooms, id, request).reasons.length === 0;
          if (available !== explained) silent.push(id + ' ' + start + '-' + end);
        }
      }
    }
    expect(silent).toEqual([]);
  });
});
