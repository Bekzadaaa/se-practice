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
| Baseline commit | 33401ef |
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

(write here)

### 4.2 Demonstration

<!-- One row per screenshot in evidence/. Say what is on it: the filter values, the rooms shown,
     the room selected, the times entered and the result. -->

| Screenshot | What it shows |
| --- | --- |
| `evidence/filter-match.png` | (write here) |
| `evidence/filter-empty.png` | (write here) |
| `evidence/switch-a.png` | (write here) |
| `evidence/switch-b.png` | (write here) |
| `evidence/narrow.png` | (write here) |

## 5. Refactoring (Task 3)

<!-- The diagrams are diagrams/before.puml and diagrams/after.puml (README section 8). -->

### 5.1 Module responsibilities after

| Module or component | Responsibility |
| --- | --- |
| `src/rooms.ts` | (write here) |
| `src/booking.ts` | (write here) |
| `src/filter.ts` | (write here) |
| (write here) | (write here) |

### 5.2 Design decisions

<!-- At least two. The alternative is what you could have done instead (often what the assistant
     proposed). The why names an AC, an F-rule, a test or a risk from 3.1. -->

| Decision | Alternative I did not take | Why |
| --- | --- | --- |
| (write here) | (write here) | (write here) |
| (write here) | (write here) | (write here) |

### 5.3 Duplication removed

<!-- One row per duplicated location that is gone. Count what you can point at, nothing else. -->

| Before (file / function, what was repeated) | After (where it lives now) |
| --- | --- |
| (write here) | (write here) |

## 6. Automated tests (Task 4)

### 6.1 Test plan

<!-- One row per required ID. A test may carry several IDs in its title,
     e.g. test('T06 B1 AC2: exactly 120 minutes is available', …) covers B1 and AC2. -->

| ID | Test title (as in the file) | Input → expected |
| --- | --- | --- |
| AC1 | (write here) | (write here) |
| AC2 | (write here) | (write here) |
| AC3 | (write here) | (write here) |
| AC4 | (write here) | (write here) |
| AC5 | (write here) | (write here) |
| F1 | (write here) | (write here) |
| F2 | (write here) | (write here) |
| F3 | (write here) | (write here) |
| F4 | (write here) | (write here) |
| F5 | (write here) | (write here) |
| B1 | (write here) | (write here) |
| B2 | (write here) | (write here) |
| B3 | (write here) | (write here) |
| B4 | (write here) | (write here) |
| B5 | (write here) | (write here) |
| B6 | (write here) | (write here) |
| INT | (write here) | (write here) |

### 6.2 Commands

<!-- The commands exactly as you typed them, from app/. -->

```text
(paste here)
```

### 6.3 Final run

<!-- The REAL output of the full run on your final code. Every test passes, and the number of
     tests equals what your test files hold (R2). -->

```text
(paste here)
```

## 7. Quality evaluation (Task 5)

<!-- Original = your baseline commit. Final = what you submit. "How I obtained it" says how you
     measured, so someone else could repeat it: "1.1 and 6.3 runs", "counted in 5.3",
     "git ls-files app/src". Do not invent a metric. Tests: write passed/total, e.g. 19/19. -->

| Measure | Original | Final | How I obtained it |
| --- | --- | --- | --- |
| Automated tests passed / total | (write here) | (write here) | (write here) |
| Duplicated logic locations removed | (write here) | (write here) | (write here) |
| Code structure: modules and their responsibilities | (write here) | (write here) | (write here) |
| Remaining limitation | (write here) | (write here) | (write here) |

## 8. AI evidence appendix

<!-- At least three exchanges, one ### 8.N block each: the analysis (Task 1), the plan, and at
     least one implementation, refactoring or test exchange. Copy the block for more.
     The prompt as you sent it; the output may be cut to the part you used, with "[…]" where
     you cut. Verified by: the test, run, file or check that confirmed it — not "it looked right". -->

### 8.1 Exchange 1

**Tool and model:** (write here)
**Date:** (write here)
**Purpose:** (write here)

**Prompt:**

```text
(paste here)
```

**Output used:**

```text
(paste here)
```

**Problems found:** (write here)
**Changes made:** (write here)
**Verified by:** (write here)

### 8.2 Exchange 2

**Tool and model:** (write here)
**Date:** (write here)
**Purpose:** (write here)

**Prompt:**

```text
(paste here)
```

**Output used:**

```text
(paste here)
```

**Problems found:** (write here)
**Changes made:** (write here)
**Verified by:** (write here)

### 8.3 Exchange 3

**Tool and model:** (write here)
**Date:** (write here)
**Purpose:** (write here)

**Prompt:**

```text
(paste here)
```

**Output used:**

```text
(paste here)
```

**Problems found:** (write here)
**Changes made:** (write here)
**Verified by:** (write here)

## 9. Checker results and known fails

<!-- Every check still FAIL or ERROR in your last run of python tests/check_sis.py, and why.
     The same IDs go in submission.yml known_fails. None left? Write: none. -->

| Check | Why it still fails |
| --- | --- |
| (write here) | (write here) |

## 10. AI reflection (Task 6)

<!-- 200–300 words, your own words, no assistant. Answer all five:
     What context did you provide the AI assistant? Which generated suggestions were useful or
     incorrect? What did you personally verify? How did tests influence your engineering
     decisions? What would you improve next? -->

(write here)
