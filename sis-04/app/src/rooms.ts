// The room catalog: data only. Times are minutes after midnight (600 = 10:00).
// Every room and booking here is fictional sample data.

export type Equipment = 'projector' | 'whiteboard' | 'computers' | 'video-call' | 'microphone';

export const EQUIPMENT: Equipment[] = ['projector', 'whiteboard', 'computers', 'video-call', 'microphone'];

export type Room = {
  id: string;
  name: string;
  capacity: number;
  equipment: Equipment[];
  blocked: boolean;
  bookings: { start: number; end: number }[];
  blockedReason?: string;
};

export const ROOMS: Room[] = [
  {
    id: 'a-101',
    name: 'A-101 Lecture Hall',
    capacity: 120,
    equipment: ['projector', 'microphone', 'whiteboard'],
    blocked: false,
    bookings: [
      { start: 510, end: 600 },
      { start: 780, end: 870 },
    ],
  },
  {
    id: 'b-204',
    name: 'B-204 Seminar Room',
    capacity: 30,
    equipment: ['projector', 'whiteboard'],
    blocked: false,
    bookings: [
      { start: 600, end: 660 },
      { start: 900, end: 960 },
    ],
  },
  {
    id: 'c-301',
    name: 'C-301 Computer Lab',
    capacity: 40,
    equipment: ['projector', 'computers'],
    blocked: true,
    blockedReason: 'Closed for maintenance',
    bookings: [{ start: 720, end: 840 }],
  },
  {
    id: 'd-105',
    name: 'D-105 Quiet Study Room',
    capacity: 8,
    equipment: ['whiteboard'],
    blocked: false,
    bookings: [],
  },
  {
    id: 'e-210',
    name: 'E-210 Meeting Room',
    capacity: 12,
    equipment: ['projector', 'video-call', 'whiteboard'],
    blocked: false,
    bookings: [{ start: 660, end: 720 }],
  },
];
