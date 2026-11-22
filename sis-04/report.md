# SIS #04 — Report: Evolving the Smart Campus Room Availability Checker

<!-- The ONLY file you write prose in. Keep every numbered heading (## 1. … ## 10.), every
     ### sub-heading and every **Label:** word — the checker finds your answers by them.
     Replace every "(write here)" and "(paste here)". Delete these <!-- --> comments if you like. -->

## 1. Setup and starting point

<!-- Model: the exact model with its version, as the tool shows it ("ChatGPT" is a tool, not a
     model). If the tool does not show it, write: not displayed
     Starting point: week-08 | week-07 | sis-03 | starter   (README section 3)
     Baseline commit: the commit that brings your starting point into sis-04/app/ UNCHANGED —
     git rev-parse --short HEAD right after that commit. It is your "initial version". -->

| Item | Value |
| --- | --- |
| Assistant (tool) | Claude (Anthropic) — a fresh chat session per exchange (no file access; it saw only what I pasted) |
| Assistant model | claude-opus-5-5 (Claude Opus 5.5) |
| Starting point | week-08 |
| Baseline commit | 1e923e5 |
| Language (ts or js) | ts |
| Vitest version | 3.2.7 |
| Where I ran the tests | a Linux terminal (Node 22) in a Claude cloud workspace, same as a Codespace |

### 1.1 Baseline run

<!-- Before you change anything: run the tests of your starting point inside app/ and paste the
     REAL output. No tests yet (starter, sis-03)? Paste the run anyway: Vitest prints
     "No test files found". That is your honest "original" number, 0/0. -->

```text
$ cd sis-04/app && npm install && npx vitest run

 RUN  v3.2.7 /home/claude/se-practice/sis-04/app

 ✓ src/booking.test.ts (21 tests) 8ms

 Test Files  1 passed (1)
      Tests  21 passed (21)
   Start at  20:02:02
   Duration  251ms (transform 53ms, setup 0ms, collect 34ms, tests 8ms, environment 0ms, prepare 61ms)
```

## 2. Context for the assistant

### 2.1 Repository map

<!-- The concise map you gave the assistant: the files that matter and one line each on what
     they do. A tree is fine:  src/App.tsx — the page, holds the rooms and the form … -->

```text
sis-04/app/ (Vite + React + TypeScript, Vitest)
  src/main.tsx                     — mounts <App/>
  src/App.tsx                      — the page: state (room, now, start, end, endOfDay, blocked, result), handleCheck() calls canBook and checkAvailability
  src/booking.ts                   — canBook({ start, end, now, blocked, bookings }): boolean (AC1–AC5); exports MAX_DURATION, DAY_END
  src/utils/availability.ts        — checkAvailability(room, start, end, now): the reasons and conflicts shown under the decision
  src/utils/time.ts                — toMinutes("HH:MM"), formatTime(minutes), currentTimeString()
  src/data/rooms.ts                — ROOMS: 4 fictional rooms (id, name, building, capacity, blocked, blockedReason, bookings with id/title)
  src/types.ts                     — Room, Booking, AvailabilityResult types
  src/components/RoomSelector.tsx  — <select> of all rooms, "(blocked)" label
  src/components/AvailabilityForm.tsx — current time, start, end, "Ends at 24:00", "Room is blocked" checkbox, Check button
  src/components/ResultPanel.tsx   — Available / Unavailable, reasons, conflicts
  src/components/BookingList.tsx   — the selected room's details and bookings
  src/booking.test.ts              — 21 Vitest tests of canBook (T01–T14, X1, X2, AC5, BUG-A, BUG-B)
```

### 2.2 The context message as sent

<!-- The whole first message of your analysis chat: the map, AC1–AC6, F1–F5 and the constraints
     (no login, payments, live APIs or database; fictional data only). Unedited. -->

```text
I am extending a small Smart Campus Room Availability Checker (React + TypeScript + Vitest). Before I change any code, I want an analysis and a plan of small steps — not a rewrite, and no code yet.

Repository map:
sis-04/app/ (Vite + React + TypeScript, Vitest)
  src/main.tsx                     — mounts <App/>
  src/App.tsx                      — the page: state (room, now, start, end, endOfDay, blocked, result), handleCheck() calls canBook and checkAvailability
  src/booking.ts                   — canBook({ start, end, now, blocked, bookings }): boolean (AC1–AC5); exports MAX_DURATION, DAY_END
  src/utils/availability.ts        — checkAvailability(room, start, end, now): the reasons and conflicts shown under the decision
  src/utils/time.ts                — toMinutes("HH:MM"), formatTime(minutes), currentTimeString()
  src/data/rooms.ts                — ROOMS: 4 fictional rooms (id, name, building, capacity, blocked, blockedReason, bookings with id/title)
  src/types.ts                     — Room, Booking, AvailabilityResult types
  src/components/RoomSelector.tsx  — <select> of all rooms, "(blocked)" label
  src/components/AvailabilityForm.tsx — current time, start, end, "Ends at 24:00", "Room is blocked" checkbox, Check button
  src/components/ResultPanel.tsx   — Available / Unavailable, reasons, conflicts
  src/components/BookingList.tsx   — the selected room's details and bookings
  src/booking.test.ts              — 21 Vitest tests of canBook (T01–T14, X1, X2, AC5, BUG-A, BUG-B)

Acceptance criteria that must be preserved:
AC1 Reject start ≥ end and requests in the past.
AC2 Enforce the maximum allowed duration (120 minutes).
AC3 Reject a blocked room.
AC4 Reject overlaps; allow bookings that only touch at endpoints.
AC5 Return Available / Unavailable without changing booking data.
AC6 Clear, responsive feedback on desktop and mobile.

New feature (room selection): a fictional catalog of at least four rooms, each with id, name, capacity, equipment list, blocked status and its own bookings. Show only the rooms that satisfy the user's requirements. The availability check must use the chosen room's bookings, not another room's data.
F1 Capacity filter: room capacity must be greater than or equal to the requested attendees.
F2 Equipment filter: the room must contain ALL selected required items.
F3 A blocked room cannot be reported as available.
F4 Show a clear empty state when no rooms match.
F5 Changing the selected room must refresh the availability result appropriately.

Required layout: src/rooms.ts (type Room = { id, name, capacity, equipment, blocked, bookings } and ROOMS), src/filter.ts (filterRooms(rooms, { attendees, equipment })), src/booking.ts (canBook unchanged, plus checkRoom(rooms, roomId, { start, end, now }) that calls canBook with that room's blocked and bookings). The page and its components import these and hold no room data or rule of their own.

Constraints: no login, payments, live APIs or database; fictional data only; no new dependencies unless needed for tests.

Key code:
--- src/App.tsx
import { useMemo, useState } from 'react';
import RoomSelector from './components/RoomSelector';
import BookingList from './components/BookingList';
import AvailabilityForm from './components/AvailabilityForm';
import ResultPanel from './components/ResultPanel';
import { ROOMS } from './data/rooms';
import { checkAvailability, DAY_END } from './utils/availability';
import { canBook } from './booking';
import { currentTimeString, toMinutes } from './utils/time';
import { AvailabilityResult } from './types';

export default function App() {
  const [roomId, setRoomId] = useState(ROOMS[0].id);
  const [now, setNow] = useState(currentTimeString());
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [endOfDay, setEndOfDay] = useState(false);
  const [blocked, setBlocked] = useState(ROOMS[0].blocked);
  const [result, setResult] = useState<AvailabilityResult | null>(null);

  const room = useMemo(() => ROOMS.find((r) => r.id === roomId)!, [roomId]);

  function handleCheck() {
    // The sample data is never modified: the blocked flag is applied to a copy of the room.
    const roomToCheck = { ...room, blocked };
    const s = toMinutes(start);
    const e = endOfDay ? DAY_END : toMinutes(end);
    const n = toMinutes(now);
    // The decision comes from canBook (src/booking.ts); checkAvailability only explains it.
    const available = canBook({ start: s, end: e, now: n, blocked, bookings: room.bookings });
    setResult({ available, ...checkAvailability(roomToCheck, s, e, n) });
  }

  // Any edit makes the last decision outdated, so it is cleared until the user checks again.
  function edited<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setResult(null);
    };
  }

  function handleRoomChange(id: string) {
    setRoomId(id);
    setBlocked(ROOMS.find((r) => r.id === id)!.blocked);
    setResult(null);
  }

  return (
    <div className="app">
      <header>
        <h1>Smart Campus Room Availability</h1>
        <p className="muted">Check whether a room is free before you request it. Sample data only.</p>
      </header>
      <main className="layout">
        <div className="column">
          <div className="card">
            <RoomSelector rooms={ROOMS} selectedId={roomId} onChange={handleRoomChange} />
          </div>
          <AvailabilityForm
            now={now}
            start={start}
            end={end}
            blocked={blocked}
            endOfDay={endOfDay}
            onEndOfDayChange={edited(setEndOfDay)}
            onBlockedChange={edited(setBlocked)}
            onNowChange={edited(setNow)}
            onStartChange={edited(setStart)}
            onEndChange={edited(setEnd)}
            onSubmit={handleCheck}
          />
          <ResultPanel result={result} />
        </div>
        <div className="column">
          <BookingList room={room} />
        </div>
      </main>
    </div>
  );
}

--- src/utils/availability.ts
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

--- src/booking.ts (canBook)
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

Please list the maintainability risks you see in this starting code, each with the file and function it is in and why it matters for AC1–AC6 or F1–F5. Then give a numbered plan of small, safe steps (smallest first), each one testable on its own. No code yet.
```

## 3. Codebase analysis (Task 1)

### 3.1 Maintainability risks

<!-- At least three, found in YOUR starting code. "Where" names a file or a function(),
     e.g. src/App.tsx, check(). Evidence is what you saw, not what the assistant said.
     Priority: High / Medium / Low. -->

| # | Risk | Where (file / function) | Evidence | Priority |
| --- | --- | --- | --- | --- |
| 1 | `blocked` is a checkbox state in the page, not the room's data, so F3 cannot hold per room | `src/App.tsx` `handleCheck()`, the "Room is blocked" box in `src/components/AvailabilityForm.tsx` | line 30 passes the state `blocked`; I ran `canBook` for C-301 (blocked in `src/data/rooms.ts`) with the box unticked: 900–960 → `true` (Available) | High |
| 2 | the rules are written twice: the decision in `canBook()` and the reasons in `checkAvailability()`, and they already disagree | `src/booking.ts` `canBook()`, `src/utils/availability.ts` `checkAvailability()` | I ran both with start = NaN: `canBook` → false, `reasons` → `[]`, so the page would show a bare "Unavailable" (AC6) | Medium |
| 3 | the page owns the room data and the lookup: `ROOMS.find(...)!` twice, and the catalog has no `equipment` and the wrong shape for F1/F2 | `src/App.tsx` (lines 21 and 44), `src/data/rooms.ts` `ROOMS`, `src/types.ts` `Room` | two identical `ROOMS.find((r) => r.id === …)!` lookups; `Room` has `building`/`blockedReason` but no `equipment`; four files import `./data/rooms` or `./types` | Medium |
| 4 | `canBook()` uses the literals 1440 and 120 although the same file exports `DAY_END` and `MAX_DURATION` | `src/booking.ts` `canBook()` | lines 14–15 export the constants, lines 24 and 26 use the numbers; the reasons use the constants, so changing one changes the message but not the decision | Low |

### 3.2 Improvement plan — before editing

<!-- Numbered, in the order you will do it, smallest safe step first. Written BEFORE you change
     code: the commit that adds this section comes before the commit that changes app/src. -->

1. Catalog first, nothing switched over: `src/rooms.ts` with `type Room = { id, name, capacity, equipment, blocked, bookings }`, an `Equipment` union and five fictional rooms (risk 3).
2. `filterRooms()` in `src/filter.ts`, tests first: F1, F2, F4 and the boundaries B5/B6 on a fixed catalog in the test file; see them fail, then add the code.
3. `checkRoom()` in `src/booking.ts`, tests first (F3, F5, INT, an unknown id, AC5), `canBook()` left exactly as it is.
4. Move the reasons next to the rules: `explainRoom()` in `src/booking.ts` gives the reasons for the chosen room, including one for an unparseable time, so the decision and the explanation live in one module (risk 2).
5. Switch the page: it imports `ROOMS`, `filterRooms`, `checkRoom`, `explainRoom`; the "Room is blocked" box and the `blocked` state go, so `blocked` comes only from the room (risk 1, F3); one lookup instead of two; delete `src/data/rooms.ts`, `src/types.ts` and `src/utils/availability.ts` (risk 3).
6. The filter on the page: attendees and equipment inputs, the list of matching rooms (blocked ones labelled), the empty state (F4), and re-checking the same times when the selected room changes (F5). Responsive at 375 px (AC6).
7. Evidence: `app/README.md`, the two PlantUML diagrams, five screenshots, the final run.

### 3.3 One AI suggestion I rejected or modified

| Suggestion (as the assistant made it) | Decision | Why — with the AC, F-rule, test or file behind it |
| --- | --- | --- |
| "Store the result next to the request that produced it (roomId plus times). Show it only while it matches the current inputs" (plan step 6) | Modified | F5 says changing the room must *refresh* the result, not hide it; I re-run `checkRoom` for the new room with the same times when a result is showing (switch-a / switch-b show exactly that), and keep clearing the result on any time edit — no second copy of the request in state |

## 4. Feature extension (Task 2)

### 4.1 What I added

<!-- Short: the catalog (how many rooms, which equipment), how the filter is chosen on the page,
     what the empty state says, what happens to an old result when the room changes. -->

- **Catalog:** five fictional rooms in `src/rooms.ts` (A-101 lecture hall, 120 seats; B-204 seminar
  room, 30; C-301 computer lab, 40, blocked for maintenance; D-105 quiet study room, 8; E-210 meeting
  room, 12), each with its own bookings and equipment from a fixed list: projector, whiteboard,
  computers, video-call, microphone.
- **Filter on the page:** an "Attendees" number box (empty = no requirement) and one checkbox per
  equipment item; the list shows only the rooms `filterRooms` returns, as radio cards with seats,
  equipment and a "Blocked" label.
- **Empty state (F4):** "No rooms match — No room has that many seats and all of the selected
  equipment. Try fewer attendees or fewer items." The Check button is disabled.
- **Room change (F5):** if a result is showing, choosing another room re-runs the check for the same
  times with that room's data; editing a time or the filter clears the old result.
- **Blocked:** the "Room is blocked" checkbox is gone; `blocked` now comes only from the room's data.

### 4.2 Demonstration

<!-- One row per screenshot in evidence/. Say what is on it: the filter values, the rooms shown,
     the room selected, the times entered and the result. -->

| Screenshot | What it shows |
| --- | --- |
| `evidence/filter-match.png` | Attendees 20, projector + whiteboard: the list shows only A-101 (120 seats) and B-204 (30); C-301 lacks a whiteboard, D-105 and E-210 are too small (F1, F2) |
| `evidence/filter-empty.png` | Attendees 50 + computers: no room has both, so "No rooms match" with the hint, and Check is disabled (F4) |
| `evidence/switch-a.png` | No filter, B-204 selected, now 09:00, 10:00–11:00 → Unavailable, "overlaps an existing booking", conflict 10:00–11:00 (B-204's own booking) |
| `evidence/switch-b.png` | Same times, E-210 selected → the result refreshed to Available for E-210, whose only booking is 11:00–12:00 (F5) |
| `evidence/narrow.png` | 375 px phone, portrait: one column, attendees 10 + projector, E-210 at 11:00–12:00 → Unavailable with its reason and conflict; no horizontal scroll (AC6) |

## 5. Refactoring (Task 3)

<!-- The diagrams are diagrams/before.puml and diagrams/after.puml (README section 8). -->

### 5.1 Module responsibilities after

| Module or component | Responsibility |
| --- | --- |
| `src/rooms.ts` | data only: the `Room` type, the `Equipment` union and list, and `ROOMS` (5 fictional rooms) |
| `src/booking.ts` | the rules: `canBook` (AC1–AC5, unchanged), `findRoom`, `checkRoom` (the chosen room's blocked + bookings, F3/F5) and `explainRoom` (the reasons) |
| `src/filter.ts` | `filterRooms` — F1 capacity ≥ attendees, F2 all selected items |
| `src/App.tsx` + `src/components/` (FilterPanel, RoomList, AvailabilityForm, ResultPanel, BookingList) | the page: holds only what the user typed, calls the three modules, shows the list, the empty state and the result |
| `src/utils/time.ts` | `HH:MM` ↔ minutes and the default current time |

### 5.2 Design decisions

<!-- At least two. The alternative is what you could have done instead (often what the assistant
     proposed). The why names an AC, an F-rule, a test or a risk from 3.1. -->

| Decision | Alternative I did not take | Why |
| --- | --- | --- |
| Blocked rooms stay in the filtered list, labelled "Blocked", and only `checkRoom` rejects them | hide blocked rooms in `filterRooms` | blocked is not a user requirement like F1/F2; a hidden room looks like it does not exist; F3 is then enforced in one place (`checkRoom` → `canBook`), which the F3 and INT tests check |
| `checkRoom` and `explainRoom` live in `src/booking.ts` next to `canBook`, and `canBook` itself is left exactly as in Practice #08 | merge everything into one rule list (as the assistant's earlier refactor in Week 10 did) | the brief fixes `canBook` as unchanged, and its own AC1–AC5 tests stay the evidence; keeping the reasons in the same module (not in `utils/`) means a rule change is made in one file, and the AC1 AC4 grid test catches any disagreement |
| F5 is a re-check of the same times for the new room, not just clearing the result | store the checked request next to the result and hide it when it no longer matches (the assistant's plan step 6) | the brief says "refresh appropriately"; switch-a/switch-b show the same times giving a different answer, with less state in the page |

### 5.3 Duplication removed

<!-- One row per duplicated location that is gone. Count what you can point at, nothing else. -->

| Before (file / function, what was repeated) | After (where it lives now) |
| --- | --- |
| `src/App.tsx`: `ROOMS.find((r) => r.id === roomId)!` in the `useMemo` and again in `handleRoomChange()` | `findRoom()` in `src/booking.ts`, used by `checkRoom`, `explainRoom` and the page |
| the blocked flag in two places: `room.blocked` in the data and the page's `blocked` state from the checkbox (`App.tsx`, `AvailabilityForm.tsx`) | only `room.blocked` in `src/rooms.ts`, read by `checkRoom` |
| the reasons in `src/utils/availability.ts` `checkAvailability()` written as a separate copy outside the rules module, with `room.bookings.filter(...)` and its own blocked check | `explainRoom()` in `src/booking.ts`, next to `canBook`; `utils/availability.ts` deleted |
| the room shape twice: `src/types.ts` `Room`/`Booking` and the data in `src/data/rooms.ts` | one `Room` type and `ROOMS` in `src/rooms.ts`; `types.ts` and `data/rooms.ts` deleted |

## 6. Automated tests (Task 4)

### 6.1 Test plan

<!-- One row per required ID. A test may carry several IDs in its title,
     e.g. test('T06 B1 AC2: exactly 120 minutes is available', …) covers B1 and AC2. -->

| ID | Test title (as in the file) | Input → expected |
| --- | --- | --- |
| AC1 | `T02 AC1: 540–570 starts exactly at the current time → Unavailable` | canBook 540–570, now 540 → false |
| AC2 | `T06 B1 AC2: 720–840 is exactly 120 minutes → Available` | canBook 720–840 → true |
| AC3 | `F3 AC3: a blocked room is never available, even for a free slot (r4, 720–780)` | checkRoom r4 720–780 → false |
| AC4 | `T09 B4 AC4: 630–690 partially overlaps 600–660 → Unavailable` | canBook 630–690 vs 600–660 → false |
| AC5 | `AC5: an Available checkRoom leaves the whole catalog unchanged` | checkRoom r2 660–720 → true; catalog JSON identical before and after |
| F1 | `F1: 15 attendees keeps only rooms with capacity >= 15` | filterRooms 15, [] → r2, r3, r4 |
| F2 | `F2: projector + whiteboard needs ALL items — a room with only a projector is out` | filterRooms 1, [projector, whiteboard] → r3, r4 (not r2) |
| F3 | `F3 AC3: a blocked room is never available, even for a free slot (r4, 720–780)` | checkRoom r4 → false; explainRoom says "This room is blocked." |
| F4 | `F4: nothing matches 50 attendees with computers — an empty list, not an error` | filterRooms 50, [computers] → [] |
| F5 | `F5: the same times use the chosen room's own bookings — r2 (booked 600–660) no, r3 yes` | checkRoom 600–660: r2 → false, r3 → true |
| B1 | `T06 B1 AC2: 720–840 is exactly 120 minutes → Available` | canBook 120 min → true |
| B2 | `T07 B2 AC2: 720–841 is 121 minutes → Unavailable` | canBook 121 min → false |
| B3 | `T01 B3 AC4: 660–720 touches the end of 600–660 → Available` | canBook touching → true |
| B4 | `T09 B4 AC4: 630–690 partially overlaps 600–660 → Unavailable` | canBook overlap → false |
| B5 | `B5 F1: capacity exactly equal to attendees (20 for 20) is included` | filterRooms 20 → r2, r3 included |
| B6 | `B6 F1: capacity one below attendees (20 for 21) is excluded` | filterRooms 21 → only r4 |
| INT | `INT F1 F2 F3: filterRooms, then checkRoom on each room it returned` | filterRooms 15, [projector, whiteboard] → r3, r4; checkRoom 600–660 → r3 true, r4 false |

### 6.2 Commands

<!-- The commands exactly as you typed them, from app/. -->

```text
cd sis-04/app
npm install
npx vitest run
npx tsc --noEmit
npm run build
```

### 6.3 Final run

<!-- The REAL output of the full run on your final code. Every test passes, and the number of
     tests equals what your test files hold (R2). -->

```text
$ npx vitest run

 RUN  v3.2.7 /home/claude/se-practice/sis-04/app

 ✓ src/catalog.test.ts (13 tests) 15ms
 ✓ src/booking.test.ts (21 tests) 4ms

 Test Files  2 passed (2)
      Tests  34 passed (34)
   Start at  20:10:53
   Duration  475ms (transform 76ms, setup 0ms, collect 90ms, tests 20ms, environment 0ms, prepare 104ms)
```

## 7. Quality evaluation (Task 5)

<!-- Original = your baseline commit. Final = what you submit. "How I obtained it" says how you
     measured, so someone else could repeat it: "1.1 and 6.3 runs", "counted in 5.3",
     "git ls-files app/src". Do not invent a metric. Tests: write passed/total, e.g. 19/19. -->

| Measure | Original | Final | How I obtained it |
| --- | --- | --- | --- |
| Automated tests passed / total | 21/21 | 34/34 | the `Tests` line of the runs in 1.1 (baseline commit 1e923e5) and 6.3 (final) |
| Duplicated logic locations removed | 0 | 4 | counted in 5.3, one row per location I can point at in the diff from 1e923e5 |
| Code structure: modules and their responsibilities | 13 files in `app/src`: rules in `booking.ts` and `utils/availability.ts`, data in `data/rooms.ts` + `types.ts`, the page picked the room and the blocked flag | 14 files: `rooms.ts` (data), `filter.ts` (F1, F2), `booking.ts` (all rules), `utils/time.ts`, App + 5 components (UI only) | `git ls-tree -r --name-only 1e923e5 sis-04/app/src` against `git ls-files src` at the end, read against 5.1 |
| Remaining limitation | — | `explainRoom` still restates AC1–AC4 next to `canBook` (kept because `canBook` must stay unchanged); and nothing renders the page in a test, so F4/F5 on the page are shown only by the screenshots | the AC1 AC4 grid test (both functions over 192 requests) and the five screenshots; there is no rendered UI test in `app/` |

## 8. AI evidence appendix

<!-- At least three exchanges, one ### 8.N block each: the analysis (Task 1), the plan, and at
     least one implementation, refactoring or test exchange. Copy the block for more.
     The prompt as you sent it; the output may be cut to the part you used, with "[…]" where
     you cut. Verified by: the test, run, file or check that confirmed it — not "it looked right". -->

### 8.1 Exchange 1

**Tool and model:** Claude (Anthropic), claude-opus-5-5, a fresh chat with no file access
**Date:** 2026-11-22
**Purpose:** Task 1 — codebase analysis: maintainability risks from the map, AC1–AC6, F1–F5 and the key code (the context message of 2.2)

**Prompt:**

```text
I am extending a small Smart Campus Room Availability Checker (React + TypeScript + Vitest). Before I change any code, I want an analysis and a plan of small steps — not a rewrite, and no code yet.

Repository map:
sis-04/app/ (Vite + React + TypeScript, Vitest)
  src/main.tsx                     — mounts <App/>
  src/App.tsx                      — the page: state (room, now, start, end, endOfDay, blocked, result), handleCheck() calls canBook and checkAvailability
  src/booking.ts                   — canBook({ start, end, now, blocked, bookings }): boolean (AC1–AC5); exports MAX_DURATION, DAY_END
  src/utils/availability.ts        — checkAvailability(room, start, end, now): the reasons and conflicts shown under the decision
  src/utils/time.ts                — toMinutes("HH:MM"), formatTime(minutes), currentTimeString()
  src/data/rooms.ts                — ROOMS: 4 fictional rooms (id, name, building, capacity, blocked, blockedReason, bookings with id/title)
  src/types.ts                     — Room, Booking, AvailabilityResult types
  src/components/RoomSelector.tsx  — <select> of all rooms, "(blocked)" label
  src/components/AvailabilityForm.tsx — current time, start, end, "Ends at 24:00", "Room is blocked" checkbox, Check button
  src/components/ResultPanel.tsx   — Available / Unavailable, reasons, conflicts
  src/components/BookingList.tsx   — the selected room's details and bookings
  src/booking.test.ts              — 21 Vitest tests of canBook (T01–T14, X1, X2, AC5, BUG-A, BUG-B)

Acceptance criteria that must be preserved:
AC1 Reject start ≥ end and requests in the past.
AC2 Enforce the maximum allowed duration (120 minutes).
AC3 Reject a blocked room.
AC4 Reject overlaps; allow bookings that only touch at endpoints.
AC5 Return Available / Unavailable without changing booking data.
AC6 Clear, responsive feedback on desktop and mobile.

New feature (room selection): a fictional catalog of at least four rooms, each with id, name, capacity, equipment list, blocked status and its own bookings. Show only the rooms that satisfy the user's requirements. The availability check must use the chosen room's bookings, not another room's data.
F1 Capacity filter: room capacity must be greater than or equal to the requested attendees.
F2 Equipment filter: the room must contain ALL selected required items.
F3 A blocked room cannot be reported as available.
F4 Show a clear empty state when no rooms match.
F5 Changing the selected room must refresh the availability result appropriately.

Required layout: src/rooms.ts (type Room = { id, name, capacity, equipment, blocked, bookings } and ROOMS), src/filter.ts (filterRooms(rooms, { attendees, equipment })), src/booking.ts (canBook unchanged, plus checkRoom(rooms, roomId, { start, end, now }) that calls canBook with that room's blocked and bookings). The page and its components import these and hold no room data or rule of their own.

Constraints: no login, payments, live APIs or database; fictional data only; no new dependencies unless needed for tests.

Key code:
--- src/App.tsx
import { useMemo, useState } from 'react';
import RoomSelector from './components/RoomSelector';
import BookingList from './components/BookingList';
import AvailabilityForm from './components/AvailabilityForm';
import ResultPanel from './components/ResultPanel';
import { ROOMS } from './data/rooms';
import { checkAvailability, DAY_END } from './utils/availability';
import { canBook } from './booking';
import { currentTimeString, toMinutes } from './utils/time';
import { AvailabilityResult } from './types';

export default function App() {
  const [roomId, setRoomId] = useState(ROOMS[0].id);
  const [now, setNow] = useState(currentTimeString());
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [endOfDay, setEndOfDay] = useState(false);
  const [blocked, setBlocked] = useState(ROOMS[0].blocked);
  const [result, setResult] = useState<AvailabilityResult | null>(null);

  const room = useMemo(() => ROOMS.find((r) => r.id === roomId)!, [roomId]);

  function handleCheck() {
    // The sample data is never modified: the blocked flag is applied to a copy of the room.
    const roomToCheck = { ...room, blocked };
    const s = toMinutes(start);
    const e = endOfDay ? DAY_END : toMinutes(end);
    const n = toMinutes(now);
    // The decision comes from canBook (src/booking.ts); checkAvailability only explains it.
    const available = canBook({ start: s, end: e, now: n, blocked, bookings: room.bookings });
    setResult({ available, ...checkAvailability(roomToCheck, s, e, n) });
  }

  // Any edit makes the last decision outdated, so it is cleared until the user checks again.
  function edited<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setResult(null);
    };
  }

  function handleRoomChange(id: string) {
    setRoomId(id);
    setBlocked(ROOMS.find((r) => r.id === id)!.blocked);
    setResult(null);
  }

  return (
    <div className="app">
      <header>
        <h1>Smart Campus Room Availability</h1>
        <p className="muted">Check whether a room is free before you request it. Sample data only.</p>
      </header>
      <main className="layout">
        <div className="column">
          <div className="card">
            <RoomSelector rooms={ROOMS} selectedId={roomId} onChange={handleRoomChange} />
          </div>
          <AvailabilityForm
            now={now}
            start={start}
            end={end}
            blocked={blocked}
            endOfDay={endOfDay}
            onEndOfDayChange={edited(setEndOfDay)}
            onBlockedChange={edited(setBlocked)}
            onNowChange={edited(setNow)}
            onStartChange={edited(setStart)}
            onEndChange={edited(setEnd)}
            onSubmit={handleCheck}
          />
          <ResultPanel result={result} />
        </div>
        <div className="column">
          <BookingList room={room} />
        </div>
      </main>
    </div>
  );
}

--- src/utils/availability.ts
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

--- src/booking.ts (canBook)
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

Please list the maintainability risks you see in this starting code, each with the file and function it is in and why it matters for AC1–AC6 or F1–F5. Then give a numbered plan of small, safe steps (smallest first), each one testable on its own. No code yet.
```

**Output used:**

```text
## Part 1: Maintainability risks in the starting code

**R1. The decision and its explanation are written twice and can disagree**
*Where:* `src/booking.ts` → `canBook()` and `src/utils/availability.ts` → `checkAvailability()`
[…] They already disagree. If `start` or `end` is empty and `toMinutes('')` returns `NaN`, `canBook` returns `false` because `0 <= NaN` is false. But every comparison in `checkAvailability` is also false, so `reasons` is empty. The user sees "Unavailable" with no explanation. Please confirm what `toMinutes('')` returns.

**R2. Magic numbers sit next to exported constants**
*Where:* `src/booking.ts` → `canBook()` uses the literals `120` and `1440`. […]

**R3. The page lets the user override the "blocked" status**
*Where:* `src/App.tsx` → the `blocked` state, `onBlockedChange`, and `handleCheck()` passing `blocked` instead of `room.blocked`. […] A user can untick the box for a blocked room and get "Available". That breaks F3 directly.

**R4. The page itself does room lookup and request conversion** […]
**R5. Non-null assertions and the assumption that a first room exists** […]
**R7. The data and the types are in the wrong place and shape for the new layout** […]
**R8. Equipment is matched as free text** […] If equipment is a plain `string[]`, "Projector" vs "projector" or a typo makes F2 fail silently. […]
[… R6, R9–R11 and a first 15-step plan cut …]
```

**Problems found:** It asked me to confirm `toMinutes('')`; it is `NaN` (I ran the same function body in Node). Its R1 scenario (an empty start field) cannot happen on the page as it is, because the time inputs are `required`, so the disagreement is real but rare. R8 (free-text equipment) was a risk for the code I was about to write, not for the starting code.
**Changes made:** Kept R1, R3, R4/R7 and R2 as my risks 2, 1, 3 and 4 in 3.1, each confirmed in the code myself; used R8 as a design input (the `Equipment` union).
**Verified by:** my own probe run: C-301 with the box unticked → `canBook` true; start NaN → `canBook` false, reasons `[]`; `toMinutes('')` → NaN; the two `ROOMS.find` lines at App.tsx 21 and 44.

### 8.2 Exchange 2

**Tool and model:** Claude (Anthropic), claude-opus-5-5, a fresh chat with no file access
**Date:** 2026-11-22
**Purpose:** the improvement plan — a follow-up in the same chat: at most 7 steps and recommendations for its four open questions

**Prompt:**

```text
Your 15 steps are too many for this assignment. Give me a plan of at most 7 numbered steps, smallest safe step first, that still ends with rooms / booking / filter / UI separated, and say which of your risks each step removes. Also answer your own four open questions with a recommendation each: blocked rooms visible or hidden, empty or 0 attendees, checkRoom with an unknown id, and toMinutes(''). Still no code.
```

**Output used:**

```text
## Plan in 7 steps
[…]
**2. Create the catalog in `src/rooms.ts`.** […] `equipment` uses a fixed list of known item names (a TypeScript union type), not free text. […]
**3. Add `filterRooms(rooms, { attendees, equipment })` in `src/filter.ts`, tests first.** F1: capacity equal to attendees is included; one less is excluded. […] F2: rooms with all the selected items are included; a room missing one item is excluded […]
**4. Add `checkRoom` to `src/booking.ts` and make the explanation match the decision (`canBook` body untouched).** […] the same slot is Unavailable in room A and Available in room B; a blocked room with a free slot is Unavailable; […] an unknown id gives Unavailable […]
**5. Switch the page to the new modules.** […] Remove the "Room is blocked" checkbox and the `blocked` state. […]
**6. Add the requirement inputs, the filtered list and selection sync (F5).** […] Store the result next to the request that produced it (`roomId` plus times). Show it only while it matches the current inputs […]
**7. Add the empty state (F4) […]** Disable Check and hide `BookingList`. […] Optionally, add 2–3 component tests with `@testing-library/react` and `jsdom` […]

## Answers to the four open questions
**1. Blocked rooms: keep them visible and labelled, and never report them as Available.** […]
**2. Empty or 0 attendees: treat both as "no capacity requirement" […]**
**3. `checkRoom` with an unknown id: return `false` (Unavailable). Don't throw.** […]
**4. `toMinutes('')`: return `NaN` […]**
```

**Problems found:** Step 6 (store the request next to the result and hide a stale one) adds state and only hides the result, while F5 asks for a refresh. Step 7's optional component tests would need `@testing-library/react` and `jsdom`. It still proposed a "Room not found" reason and a NaN reason — the latter is what my R1 risk needed.
**Changes made:** My plan in 3.2 follows its order (catalog → filter → checkRoom → page → filter UI) but I modified step 6 (3.3): re-check the new room with the same times. I took its four recommendations: blocked rooms visible and labelled, empty attendees = 0, unknown id → false, `toMinutes('')` stays NaN. No jsdom tests.
**Verified by:** the F5 test (r2 vs r3 for 600–660) and the switch-a / switch-b screenshots; the F3 and INT tests for the blocked-room decision; the unknown-id test.

### 8.3 Exchange 3

**Tool and model:** Claude (Anthropic), claude-opus-5-5, a fresh chat with no file access
**Date:** 2026-11-22
**Purpose:** Task 2 — implementation of `filterRooms` (F1, F2), after my tests for it were written and failing

**Prompt:**

```text
Write src/filter.ts for my React + TypeScript room checker. One exported function, nothing else, no new dependencies:

  export function filterRooms(rooms: Room[], criteria: { attendees: number; equipment: Equipment[] }): Room[]

The types come from src/rooms.ts:
  export type Equipment = 'projector' | 'whiteboard' | 'computers' | 'video-call' | 'microphone';
  export type Room = { id: string; name: string; capacity: number; equipment: Equipment[]; blocked: boolean; bookings: { start: number; end: number }[]; blockedReason?: string };

Rules:
F1 Capacity filter: room capacity must be greater than or equal to the requested attendees.
F2 Equipment filter: the room must contain ALL selected required items.
Blocked rooms stay in the result (the availability check rejects them later). Keep the input order and do not change the input array or the rooms. Give me only the file, then two lines on how you would test it.
```

**Output used:**

```text
// src/filter.ts
import type { Equipment, Room } from './rooms';

export function filterRooms(
  rooms: Room[],
  criteria: { attendees: number; equipment: Equipment[] }
): Room[] {
  return rooms.filter(
    (room) =>
      room.capacity >= criteria.attendees &&
      criteria.equipment.every((item) => room.equipment.includes(item))
  );
}

Testing: In Vitest or Jest, build a small fixture of rooms and check these cases. Capacity exactly equal to attendees passes and one below fails (F1). A room missing any one required item is dropped, and an empty equipment list keeps every room (F2). A blocked room that matches stays in the result. […]
```

**Problems found:** None in the logic: it used `every` (all items, not `some`) and `>=` (capacity equal to attendees included). It does not handle `NaN` attendees — `capacity >= NaN` is false for every room — so the page must never pass NaN.
**Changes made:** Used the file as returned. On the page, an empty attendees box becomes 0 (`Number(attendees) || 0` in `App.tsx`).
**Verified by:** my tests written before the code: the run failed with "Cannot find module './filter'", then F1, F2 (twice), F4, B5, B6 passed — 27 passed (27); later the INT test runs `filterRooms` then `checkRoom`.

## 9. Checker results and known fails

<!-- Every check still FAIL or ERROR in your last run of python tests/check_sis.py, and why.
     The same IDs go in submission.yml known_fails. None left? Write: none. -->

| Check | Why it still fails |
| --- | --- |
| none | The last checker run is clean (33/33). |

## 10. AI reflection (Task 6)

<!-- 200–300 words, your own words, no assistant. Answer all five:
     What context did you provide the AI assistant? Which generated suggestions were useful or
     incorrect? What did you personally verify? How did tests influence your engineering
     decisions? What would you improve next? -->

I gave the assistant one context message: the repository map, AC1–AC6, F1–F5, the fixed module names
and the constraints, plus the code of `App.tsx`, `checkAvailability` and `canBook`. With the code in
front of it, its analysis was useful and specific. It found the blocked checkbox that lets a user
make C-301 Available, and the NaN case where `canBook` says Unavailable but no reason is shown. Both
were real when I ran them. Its first plan had fifteen steps, which is a rewrite in slow motion, so I
asked for seven. Its suggestion to store the request next to the result I changed: F5 asks for a
refresh, so the page now re-checks the same times for the new room.

The `filterRooms` it wrote was correct, with `every` and `>=`, but I only trusted it because my
F2 test already had a room with just a projector and my B5/B6 tests had capacity 20 against 20 and 21.
I wrote those tests from F1 and F2 before asking, and saw them fail first.

Tests decided two things. Because `canBook` must stay unchanged, I kept the reasons as a separate
`explainRoom` and added a grid test that fails if the reasons and the decision ever disagree. And the
INT test made me keep blocked rooms in the filter result, since F3 is checked by `checkRoom`.

What I personally verified: every risk by running it, every screenshot by its result text, and the
final run of 34 tests. Next I would add a rendered page test for F4 and F5, and merge `explainRoom`
into the same rule list as `canBook` once the course allows changing it.
