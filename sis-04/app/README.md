# Smart Campus Room Availability Checker

Find a fictional campus room that fits your group and equipment, then check whether a time is free.
No login, no database, no network: all rooms and bookings are fictional sample data in `src/rooms.ts`.

## Setup, run, test

```bash
npm install          # setup
npm run dev          # run the page (Vite dev server)
npx vitest run       # run the tests (or: npm test)
npm run build        # type-check and build
```

## Modules

| File | Responsibility |
| --- | --- |
| `src/rooms.ts` | data only: the `Room` type, the `Equipment` list and `ROOMS` (5 fictional rooms) |
| `src/filter.ts` | `filterRooms(rooms, { attendees, equipment })` — F1 capacity ≥ attendees, F2 all selected equipment |
| `src/booking.ts` | `canBook` (AC1–AC5, unchanged since Practice #08), `findRoom`, `checkRoom` (the chosen room's own blocked flag and bookings, F3/F5) and `explainRoom` (the reasons shown under the decision) |
| `src/utils/time.ts` | `HH:MM` ↔ minutes, and the browser's current time as the default |
| `src/App.tsx` + `src/components/` | the page: inputs, the list of matching rooms, the empty state, the result — no room data and no rule of its own |

Times are minutes after midnight (600 = 10:00). Intervals include the start and exclude the end,
so a booking that only touches another one is allowed.
