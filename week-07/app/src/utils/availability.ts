import { AvailabilityResult, Room } from '../types';

export const MAX_DURATION = 120;
export const DAY_END = 1440;

// Decides whether [start, end) can be booked in the room.
// Intervals include the start and exclude the end.
export function checkAvailability(room: Room, start: number, end: number, now: number): AvailabilityResult {
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

  return { available: reasons.length === 0, reasons, conflicts };
}
