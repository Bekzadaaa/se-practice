import { describe, test, expect } from 'vitest';
import { filterRooms } from './filter';
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
