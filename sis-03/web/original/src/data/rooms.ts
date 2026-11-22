import { Room } from '../types';

// Fictional sample data for the prototype. Times are minutes after midnight.
export const ROOMS: Room[] = [
  {
    id: 'a-101',
    name: 'A-101 Lecture Hall',
    building: 'Main Building',
    capacity: 120,
    blocked: false,
    bookings: [
      { id: 'a1', title: 'Intro to Algorithms', start: 510, end: 600 },
      { id: 'a2', title: 'Physics Seminar', start: 780, end: 870 },
    ],
  },
  {
    id: 'b-204',
    name: 'B-204 Seminar Room',
    building: 'Library Wing',
    capacity: 30,
    blocked: false,
    bookings: [
      { id: 'b1', title: 'Study Group: Databases', start: 600, end: 660 },
      { id: 'b2', title: 'Robotics Club', start: 900, end: 960 },
    ],
  },
  {
    id: 'c-301',
    name: 'C-301 Computer Lab',
    building: 'Engineering Block',
    capacity: 40,
    blocked: true,
    blockedReason: 'Closed for maintenance',
    bookings: [{ id: 'c1', title: 'Network Lab', start: 720, end: 840 }],
  },
  {
    id: 'd-105',
    name: 'D-105 Quiet Study Room',
    building: 'Student Center',
    capacity: 8,
    blocked: false,
    bookings: [],
  },
];
