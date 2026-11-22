import { Booking, Room } from '../types';
import { DAY_END, MAX_DURATION } from '../booking';

export { DAY_END, MAX_DURATION };

export interface AvailabilityFeedback {
  reasons: string[];
  conflicts: Booking[];
}

// Explains WHY a request is unavailable, for the result panel.
// The decision itself is canBook() in src/booking.ts; the page calls it.
export function checkAvailability(room: Room, start: number, end: number, now: number): AvailabilityFeedback {
  const reasons: string[] = [];

  if (start < 0 || end > DAY_END) {
    reasons.push('The time must be within the day (00:00–24:00).');
  }
  if (start >= end) {
    reasons.push('The end time must be after the start time.');
  }
  if (start <= now) {
    reasons.push('The start time must be after the current time.');
  }
  if (end - start > MAX_DURATION) {
    reasons.push('A booking cannot be longer than 2 hours.');
  }
  if (room.blocked) {
    reasons.push(`This room is blocked${room.blockedReason ? `: ${room.blockedReason}` : ''}.`);
  }

  const conflicts = room.bookings.filter((b) => start < b.end && end > b.start);
  if (conflicts.length > 0) {
    reasons.push('The requested time overlaps an existing booking.');
  }

  return { reasons, conflicts };
}
