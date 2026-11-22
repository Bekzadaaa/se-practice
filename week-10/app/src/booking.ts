export interface Interval {
  start: number; // minutes after midnight, included
  end: number; // minutes after midnight, excluded
}

export interface BookingRequest<B extends Interval = Interval> {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  bookings: B[];
}

export const MAX_DURATION = 120;
export const DAY_END = 1440;

// One code per broken rule, in the order the reasons are shown on the page.
export type Violation =
  | 'outside-day' // AC1
  | 'end-not-after-start' // AC1
  | 'not-in-future' // AC1
  | 'too-long' // AC2
  | 'blocked' // AC3
  | 'overlap'; // AC4

export interface Evaluation<B extends Interval> {
  violations: Violation[];
  conflicts: B[];
}

// The only place the AC1–AC4 rules are written. Pure: reads the request, never changes it (AC5).
// The AC1 checks are "not (what must hold)", so a NaN time breaks a rule instead of slipping past it.
export function evaluateBooking<B extends Interval>({ start, end, now, blocked, bookings }: BookingRequest<B>): Evaluation<B> {
  const violations: Violation[] = [];
  if (!(0 <= start && end <= DAY_END)) violations.push('outside-day');
  if (!(start < end)) violations.push('end-not-after-start');
  if (!(start > now)) violations.push('not-in-future');
  if (end - start > MAX_DURATION) violations.push('too-long');
  if (blocked) violations.push('blocked');
  const conflicts = bookings.filter((b) => start < b.end && end > b.start);
  if (conflicts.length > 0) violations.push('overlap');
  return { violations, conflicts };
}

// Available exactly when no rule is broken.
export function canBook(request: BookingRequest): boolean {
  return evaluateBooking(request).violations.length === 0;
}
