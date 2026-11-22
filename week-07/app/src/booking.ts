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

// The booking decision, moved out of checkAvailability() in src/utils/availability.ts
// with the same conditions in the same order. true = Available, false = Unavailable.
export function canBook({ start, end, now, blocked, bookings }: BookingRequest): boolean {
  if (start < 0 || end > DAY_END) return false;
  if (start >= end) return false;
  if (start <= now) return false;
  if (end - start > MAX_DURATION) return false;
  if (blocked) return false;
  if (bookings.some((b) => start < b.end && end > b.start)) return false;
  return true;
}
