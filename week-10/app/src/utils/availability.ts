import { Booking, Room } from '../types';
import { DAY_END, MAX_DURATION, evaluateBooking, type Violation } from '../booking';

export { DAY_END, MAX_DURATION };

export interface AvailabilityFeedback {
  reasons: string[];
  conflicts: Booking[];
}

// Explains WHY a request is unavailable, for the result panel.
// The rules live only in evaluateBooking() (src/booking.ts), which canBook() also uses,
// so this file only puts each broken rule into words and cannot disagree with the decision.
export function checkAvailability(room: Room, start: number, end: number, now: number): AvailabilityFeedback {
  const { violations, conflicts } = evaluateBooking({ start, end, now, blocked: room.blocked, bookings: room.bookings });
  // Record<Violation, string>: the build fails if a rule is ever added without a reason text.
  const messages: Record<Violation, string> = {
    'outside-day': 'The time must be within the day (00:00–24:00).',
    'end-not-after-start': 'The end time must be after the start time.',
    'not-in-future': 'The start time must be after the current time.',
    'too-long': 'A booking cannot be longer than 2 hours.',
    blocked: `This room is blocked${room.blockedReason ? `: ${room.blockedReason}` : ''}.`,
    overlap: 'The requested time overlaps an existing booking.',
  };
  return { reasons: violations.map((v) => messages[v]), conflicts };
}
