export interface Booking {
  id: string;
  title: string;
  start: number; // minutes after midnight
  end: number; // minutes after midnight (exclusive)
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
  blockedReason?: string;
  bookings: Booking[];
}

export interface AvailabilityResult {
  available: boolean;
  reasons: string[];
  conflicts: Booking[];
}
