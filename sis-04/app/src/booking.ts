import type { Room } from './rooms';

export interface Interval {
  start: number; // minutes after midnight, included
  end: number; // minutes after midnight, excluded
}

export interface BookingRequest {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  bookings: Interval[];
}

export const MAX_DURATION = 120;
export const DAY_END = 1440;

export function canBook({ start, end, now, blocked, bookings }: {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  bookings: { start: number; end: number }[];
}): boolean {
  if (!(0 <= start && start < end && end <= 1440)) return false;
  if (!(start > now)) return false;
  if (end - start > 120) return false;
  if (blocked) return false;
  for (const b of bookings) {
    if (start < b.end && end > b.start) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------------------------
// The chosen room (SIS #04). canBook above is unchanged; everything below only reads the catalog.

type Request = { start: number; end: number; now: number };

// The one place a room is looked up by id (the page used to do it twice).
export function findRoom(rooms: Room[], roomId: string): Room | undefined {
  return rooms.find((room) => room.id === roomId);
}

// F3, F5: the decision for THIS room — its own blocked flag and its own bookings. Unknown id: false.
export function checkRoom(rooms: Room[], roomId: string, request: Request): boolean {
  const room = findRoom(rooms, roomId);
  if (!room) return false;
  return canBook({ ...request, blocked: room.blocked, bookings: room.bookings });
}

// The reasons shown under the decision (AC6). Written as "not (what must hold)" so that an
// unparseable time (NaN) still gets a reason; a test checks it agrees with checkRoom.
export function explainRoom(rooms: Room[], roomId: string, { start, end, now }: Request) {
  const room = findRoom(rooms, roomId);
  if (!room) return { reasons: ['This room is not in the catalog.'], conflicts: [] };
  const reasons: string[] = [];
  if ([start, end, now].some((t) => Number.isNaN(t))) {
    reasons.push('Enter the current time, the start and the end.');
  }
  if (!(0 <= start && end <= DAY_END)) reasons.push('The time must be within the day (00:00–24:00).');
  if (!(start < end)) reasons.push('The end time must be after the start time.');
  if (!(start > now)) reasons.push('The start time must be after the current time.');
  if (end - start > MAX_DURATION) reasons.push('A booking cannot be longer than 2 hours.');
  if (room.blocked) reasons.push(room.blockedReason ? `This room is blocked: ${room.blockedReason}.` : 'This room is blocked.');
  const conflicts = room.bookings.filter((b) => start < b.end && end > b.start);
  if (conflicts.length > 0) reasons.push('The requested time overlaps an existing booking.');
  return { reasons, conflicts };
}
