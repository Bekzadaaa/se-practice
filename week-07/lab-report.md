# Week 07 — Lab report

**Name:** Sultan Bekzada (24B032035)
**Group:** Software Engineering practice, Monday 16:00–19:00
**Date:** 2026-11-22

Fill in every section. **Do not delete, rename or renumber the headings.** The checker and the
grader find your answers by them. You can add rows to any table, but never remove its header.

---

## 1. Setup

| | |
| --- | --- |
| Project I continue (`week-06` = my Week 06 Bolt project, `starter` = the provided starter) | week-06 (my Week 06 final, `week-06/prototype`, generated with the fallback builder Claude) |
| Bolt project link (or `not shared`, and why) | not shared — Week 06 was built without Bolt (see Week 06 §1); the source is in `app/` |
| Assistant that generated the tests (tool) | Claude (Anthropic) |
| Exact model (with its version, or `not displayed`) | claude-opus-5-5 (Claude Opus 5.5) |
| Where I ran the tests (Bolt terminal / my computer / Codespace) | a Linux terminal (Node 22, npm) in a Claude cloud workspace — same as a Codespace |
| Vitest version (the `RUN  v…` line of a run) | |
| Test command | `npx vitest run` (also `npm test`) inside `week-07/app/` |

---

## 2. Task 1 — baseline and the booking function

**Before editing:** where did the booking decision live in the project you started from?

| | |
| --- | --- |
| File and function (or "inside the page component") | `src/utils/availability.ts`, `checkAvailability(room, start, end, now)` |
| Its inputs | the whole `Room` object (with `blocked` and `bookings`), and `start`, `end`, `now` in minutes |
| What it returned | an object `{ available, reasons, conflicts }` — `available` was `reasons.length === 0` |
| How the page used it | `App.tsx` `handleCheck()` converted HH:MM to minutes, called it with a copy of the room (blocked flag from the checkbox) and stored the whole object as the result shown by `ResultPanel` |

**What I changed to extract `canBook`.** Say which file it now lives in, what you moved, and why
the behaviour did not change. Also say which file of the page now calls it. 40 words or more.

<!-- Write below this line -->

The decision now lives in `src/booking.ts` as `canBook({ start, end, now, blocked, bookings })`,
which returns only true or false. I moved the six conditions out of `checkAvailability` in the same
order and with the same comparisons (`start < 0 || end > 1440`, `start >= end`, `start <= now`,
`end - start > 120`, `blocked`, and `start < b.end && end > b.start` for each booking), so every input
gives the same decision as before. `MAX_DURATION` and `DAY_END` moved with it. `checkAvailability`
stays in `src/utils/availability.ts` but now returns only the reasons and conflicts for the messages.
`src/App.tsx` imports `canBook` from `./booking` and calls it in `handleCheck()` for the Available /
Unavailable decision. I reran T1–T9 in the browser after the change: still 9/9, same messages.

---

## 3. Task 2 — the test plan

Default fixture: `now = 540`, `blocked = false`, `bookings = [{ start: 600, end: 660 }]`, fresh
for every test. **The Expected column comes from AC1–AC4, never from the code.** Write the
**reason** for each expected result **before** you send the generation prompt.

| ID | Candidate / changed input | Expected | AC | Reason (in your words) |
| --- | --- | --- | --- | --- |
| T01 | 660–720 (touching after) | true | AC4 | The booking is [600, 660); the end 660 is excluded, so 660–720 only touches it and nothing overlaps. 540 < 660, 60 min, not blocked. |
| T02 | 540–570 (starts now) | false | AC1 | start 540 equals now 540; AC1 needs start strictly after the current time, so a request starting now is rejected. |
| T03 | 720–720 (zero duration) | false | AC1 | start 720 is not less than end 720; AC1 needs start < end, a zero-length interval is not a booking. |
| T04 | 750–720 (reversed) | false | AC1 | start 750 is after end 720, so start < end fails; a reversed interval is rejected even though it does not overlap. |
| T05 | 1380–1441 (past day end) | false | AC1 | end 1441 is one minute past 1440 (24:00); AC1 needs end ≤ 1440, so it is rejected though the length is only 61 min. |
| T06 | 720–840 (120 minutes) | true | AC2 | 840 − 720 = 120 minutes; AC2 rejects only bookings longer than 120, so exactly 2 hours is allowed. No overlap with 600–660. |
| T07 | 720–841 (121 minutes) | false | AC2 | 841 − 720 = 121 minutes, one minute longer than 120, so AC2 rejects it. |
| T08 | 570–600 (touching before) | true | AC4 | The request [570, 600) excludes 600, where the booking starts, so they only touch. 570 > now 540, 30 min. |
| T09 | 630–690 (partial overlap) | false | AC4 | 630 is inside 600–660 and 690 is after it: the minutes 630–659 belong to both, so it overlaps. |
| T10 | 570–690 (contains booking) | false | AC4 | 570–690 starts before and ends after the booking, so it covers all of 600–660: overlap. |
| T11 | 615–645 (inside booking) | false | AC4 | 615–645 lies completely inside 600–660; every minute of it is already booked. |
| T12 | 600–660 (identical interval) | false | AC4 | The same interval as the booking: all 60 minutes overlap, touching does not apply. |
| T13 | 660–720, blocked = true | false | AC3 | 660–720 would be Available (T01), but the room is blocked, and AC3 rejects any request for a blocked room. |
| T14 | 630–690, bookings = [] | true | AC4 | 630–690 overlapped only because of the 600–660 booking (T09); with no bookings there is nothing to overlap and AC1/AC2 hold. |
| AC5 | an Available request — the bookings after the call equal the bookings before | true, data unchanged | AC5 | A check is only a question: after an Available 660–720 the bookings array must still be exactly [{600,660}] — nothing added or changed. |
| X1 | 1380–1440 (23:00–24:00, ends exactly at the end of the day) | true | AC1 | AC1 allows end ≤ 1440, so ending exactly at 24:00 is valid; 60 min, after now, no overlap. T05 checks 1441 (just past), X1 checks the other side of the same boundary. |
| X2 | 660–720 with bookings = [{600–660}, {720–780}] (touches two bookings) | true | AC4 | The request starts where one booking ends and ends where the next starts; both ends only touch, so no minute is shared. T01/T08 test one touching side at a time, never both at once. |

X1 and X2 are **your own two cases**: a boundary or a state that T01–T14 do not reach. Fill all
five columns.

---

## 4. Task 3 — the generation prompt and the first suite

**The prompt exactly as I sent it.** Use the deck's prompt with `[our test framework]` replaced by
`Vitest`, followed by the case table from section 3:

```text
Generate tests for the existing booking function using Vitest. Use AC1–AC6 and the reviewed case table below.

Import the real function used by the page. Keep its code unchanged. Use fixed time and fresh fixtures. Assert exact decisions and unchanged booking data.

Return the test file, run command, and AC mapping. Flag unclear requirements. We will run the tests ourselves.

Default fixture: now = 540, blocked = false, bookings = [{ start: 600, end: 660 }]. Minutes after midnight.

| ID | Candidate / changed input | Expected | AC |
| --- | --- | --- | --- |
| T01 | 660–720 (touching after) | true | AC4 |
| T02 | 540–570 (starts now) | false | AC1 |
| T03 | 720–720 (zero duration) | false | AC1 |
| T04 | 750–720 (reversed) | false | AC1 |
| T05 | 1380–1441 (past day end) | false | AC1 |
| T06 | 720–840 (120 minutes) | true | AC2 |
| T07 | 720–841 (121 minutes) | false | AC2 |
| T08 | 570–600 (touching before) | true | AC4 |
| T09 | 630–690 (partial overlap) | false | AC4 |
| T10 | 570–690 (contains booking) | false | AC4 |
| T11 | 615–645 (inside booking) | false | AC4 |
| T12 | 600–660 (identical interval) | false | AC4 |
| T13 | 660–720, blocked = true | false | AC3 |
| T14 | 630–690, bookings = [] | true | AC4 |
| AC5 | an Available request — bookings after the call equal bookings before | true, data unchanged | AC5 |
| X1 | 1380–1440 (ends exactly at 24:00) | true | AC1 |
| X2 | 660–720 with bookings [{600–660}, {720–780}] | true | AC4 |

AC1: Accept a candidate interval only when 0 ≤ start < end ≤ 1440 and start is after the supplied current time.
AC2: Reject a booking longer than 120 minutes.
AC3: Reject the request when the selected room is blocked.
AC4: Reject any interval that overlaps an existing booking; touching endpoints are allowed.
AC5: Show a clear Available / Unavailable decision without changing the existing booking data.
AC6: The page remains usable at desktop and narrow/mobile width and gives understandable validation feedback.

src/booking.ts (used by src/App.tsx):
export function canBook({ start, end, now, blocked, bookings }: BookingRequest): boolean {
  if (start < 0 || end > DAY_END) return false;
  if (start >= end) return false;
  if (start <= now) return false;
  if (end - start > MAX_DURATION) return false;
  if (blocked) return false;
  if (bookings.some((b) => start < b.end && end > b.start)) return false;
  return true;
}
```

**The assistant's answer: run command, AC mapping and any unclear requirements it flagged,
pasted unedited.** Its test file goes to `suites/first/` and is not pasted here:

```text
Test file: src/booking.test.ts (beside src/booking.ts) — saved unedited as suites/first/booking.test.ts.

Run command (inside the project folder):
  npm install -D vitest
  npx vitest run

AC mapping:
- AC1 — T02 (start = now), T03 (zero length), T04 (reversed), T05 (end 1441), X1 (end exactly 1440)
- AC2 — T06 (exactly 120 min, allowed), T07 (121 min, rejected)
- AC3 — T13 (blocked room, otherwise free slot)
- AC4 — T01, T08 (touching after / before), T09–T12 (overlaps, as one it.each table), T14 (no bookings), X2 (touching two bookings)
- AC5 — the AC5 test: an Available call (660–720), then bookings compared with a structuredClone taken before
- AC6 — not covered: it is about the page (layout, validation messages), so it needs a manual / UI check, not a unit test of canBook.

Unclear requirements (flagged, not decided by the tests):
1. Existing bookings that are themselves invalid (e.g. { start: 700, end: 650 }) — no AC says how canBook should treat them.
2. now outside 0–1440, or non-integer minutes — the function does not validate them; the ACs assume valid numbers.
3. AC1 says start must be "after" the current time; the table (T02) reads this as strictly after, which I followed.
4. "Longer than 120 minutes" is read as end - start > 120, so exactly 120 is allowed (T06).
```

The first suite was saved to `suites/first/` **before** I changed anything in it: yes

---

## 5. Task 4 — review of the first suite

Review it **before** you run it. Look at the imports, the expected values, isolation, duplicates
and skipped tests. Make one row per decision. At least **two** rows, and each one names the kind of
weakness (the deck's table: *no exception occurred* · *expected = current output* · *only valid
requests* · *mocked booking function*, or your own) and the AC that decides it.

| # | Test or part of the suite | What is weak or wrong | Decision: accept / revise / reject | AC or reason |
| --- | --- | --- | --- | --- |
| 1 | T09–T12 written as one `it.each` table with titles from `%s` | Own: table-driven — the IDs exist only as data, not in the source; one failing row is reported under a generated name, and the course rule is one test per case | revise — four separate tests, each with its ID and input in the title | AC4 (overlap rule), rule "no test.each" |
| 2 | Module-level `const bookings` shared by `request()` in every test, including the AC5 test | Own: isolation — every test passes the same array; if `canBook` ever pushed into it, later tests would run on changed data and the order would decide the result | revise — a `defaultBookings()` factory, a fresh array per test | AC5: the data must stay unchanged, and the test must not depend on other tests |
| 3 | Expected values of T01–T14, X1, X2 | Checked for *expected = current output*: all 17 decisions match the plan in §3, which comes from the ACs (T06 true for exactly 120 min by AC2, T02 false for start = now by AC1) | accept | AC1, AC2, AC4 |
| 4 | AC5 test (660–720, `structuredClone`, `toEqual`) | Checked for *no exception occurred*: it asserts `.toBe(true)` first, so the request really is Available and reaches the overlap loop, then compares the data | accept (rewritten with the fresh fixture and `JSON.stringify`) | AC5 |
| 5 | Imports | Checked for *mocked booking function*: `import { canBook } from './booking'`, no `vi.mock` | accept | the deck: import the function used by the page |
| 6 | Boundaries | *Only valid requests* is not the problem, but two boundaries are missing: start one minute after now (541) and a one-minute overlap (659–720) | revise — two tests added after the improvement prompt | AC1, AC4 |

---

## 6. Task 5 — running, diagnosing, improving

### 6.1 The first run

The **real** terminal output of the first run of the first suite, pasted unedited. Include the
`RUN  v…` line and the `Tests` summary line. A build message or the assistant saying "tests pass"
is not a run.

```text
$ npx vitest run

 RUN  v3.2.7 /home/claude/se-practice/week-07/app

 ✓ src/booking.test.ts (17 tests) 4ms

 Test Files  1 passed (1)
      Tests  17 passed (17)
   Start at  18:45:48
   Duration  222ms (transform 39ms, setup 0ms, collect 34ms, tests 4ms, environment 0ms, prepare 48ms)
```

Vitest counts 17 tests although the file has 14 `it(...)` calls: the `it.each` table expands into
four tests (T09–T12).

**Each failure, diagnosed** (the deck's table: import/runner error · assertion mismatch · result
changing per run · no tests discovered). Write `none` in the first row if nothing failed.

| Failing test | Observed failure | First check | Test repair or implementation fix? | Action taken |
| --- | --- | --- | --- | --- |
| none | 0 failed, 17 passed | expected values compared with §3 by hand before running (all from the ACs) | neither | none needed; a green first run is only evidence for these cases, so the suite was still reviewed (§5) and tried against M1–M3 (§7) |

### 6.2 The improvement prompt

The deck's improvement prompt exactly as sent, followed by the actual output from 6.1. Then
paste the assistant's answer, unedited:

```text
Review this test suite against AC1–AC6 and our case table. Identify incorrect expectations, weak assertions, duplicated cases, and missing boundaries.

For each proposed change, explain the requirement and the defect it could detect. Improve the tests without changing correct expectations to match buggy behavior.

Use the actual failure output below. Separate test repairs from implementation fixes.

$ npx vitest run

 RUN  v3.2.7 /home/claude/se-practice/week-07/app

 ✓ src/booking.test.ts (17 tests) 4ms

 Test Files  1 passed (1)
      Tests  17 passed (17)
   Start at  18:45:48
   Duration  222ms (transform 39ms, setup 0ms, collect 34ms, tests 4ms, environment 0ms, prepare 48ms)

--- Answer ---
Incorrect expectations: none. All 17 expected decisions match the case table and AC1–AC4 (T06 true for exactly 120 minutes, T02 false for start = now, T01/T08/X2 true for touching). The run has no failures, so there is nothing to diagnose as an implementation fix.

Implementation fixes: none. canBook gave the table's answer for every case.

Test repairs and improvements:
1. Weak structure — T09–T12 are one it.each. A failure there is reported under a generated title and the IDs are not searchable in the source. Split into four tests, one per ID. Requirement AC4; defect detected: same as now, but each overlap shape is reported separately.
2. Weak isolation — every test shares the module-level `bookings` array. A canBook that mutated its input (e.g. pushed the accepted request) would make later tests depend on the order. Use a factory that returns a fresh array per test. Requirement AC5; defect detected: a mutation would show up in the AC5 test itself instead of corrupting other tests.
3. AC5 assertion — keep `.toBe(true)` before the data comparison (so the request really is Available), and compare by value (JSON.stringify or toEqual against the literal [{600,660}]), not only against a clone of the same array.
4. Missing boundary (AC1): start one minute after now, 541–600 → true. Detects a "start must be at least 2 minutes after now" or an off-by-one like start <= now + 1.
5. Missing boundary (AC4): a one-minute overlap, 659–720 → false. Detects an overlap check that only compares whole intervals or uses b.end - 1.
6. Duplicated cases: none — T01 and T13 share 660–720 on purpose (blocked changes the answer).
Not changed: X1 (1380–1440) and X2 (two touching bookings) already cover the end-of-day boundary and both touching sides at once.
```

I accepted 1–5 (they match my own review in §5) and applied them to `app/src/booking.test.ts`; no
expected value was changed. The final suite has 19 tests.

### 6.3 The final run

The **real** output of the final suite (`booking.test.*` beside your module), after every
change and after restoring the correct code from section 7. Every test must pass. If a real defect
is still open, leave its test failing and explain it in 9.1.

```text
(paste here)
```

---

## 7. Task 6 — deliberate defects

You need a reviewed, passing suite first. Then introduce **one** defect at a time in your booking
module, leave the tests unchanged, run, record, and **restore** the code. A syntax or import
error does not count as detection.

| Trial | Intentional change | Detected / Survived | Failing test ID(s) | If it survived: why, and what you added |
| --- | --- | --- | --- | --- |
| M1 | Reject duration >= 120 instead of > 120 | Detected / Survived | | |
| M2 | Treat touching endpoints as an overlap | Detected / Survived | | |
| M3 | Remove the blocked-room rejection | Detected / Survived | | |

**The run of each mutant, pasted unedited.** Paste the `Tests` summary line and the failing test
names at least:

```text
(paste here)
```

All three changes reverted, and the full suite run again (section 6.3): yes / no

---

## 8. Task 7 — manual UI checks

Use `now = 09:00` and an existing `10:00–11:00` booking. Do them in the page in a browser. Save a
screenshot of each as `evidence/ui-1.png` … `evidence/ui-5.png`. Take **ui-4 at phone width**
(about 375 px, portrait).

| # | Action | Expected observation | AC | What I observed | Pass / Fail / Not testable |
| --- | --- | --- | --- | --- | --- |
| U1 | Check 11:00–12:00, unblocked | Available, with the fixed sample booking | AC5 | | Pass / Fail / Not testable |
| U2 | Enable blocked, then check again | Unavailable replaces the earlier result | AC3, AC5 | | Pass / Fail / Not testable |
| U3 | Clear a required input and submit | Understandable validation feedback | AC6 | | Pass / Fail / Not testable |
| U4 | Use a narrow (phone) width | Controls and result remain usable | AC6 | | Pass / Fail / Not testable |
| U5 | Repeat the checks on the same data | Existing bookings remain unchanged | AC5 | | Pass / Fail / Not testable |

---

## 9. Comparison and what still fails

### 9.1 Checks I am keeping as FAIL or ERROR

Use the same IDs as `known_fails` in `submission.yml`. Write `none` if the run is clean.

| Check | Why it stays |
| --- | --- |
| | |

### 9.2 Original and improved suites

| Measure | First suite | Improved suite |
| --- | --- | --- |
| Executed / passed / failed | | |
| Requirements with meaningful tests (AC IDs and gaps) | | |
| Selected mutants detected | | |
| Accepted / revised / rejected tests | | |
| Remaining limitations | | |

### 9.3 What no AC decides

Call your function with `bookings = [{ start: 700, end: 650 }]` (a reversed existing booking)
and a request of 660–720. What does it return? Does any AC say what it should return? (This is
the value you declare in `submission.yml` under `assumptions.invalid_existing_booking`.)

-

---

## 10. Conclusion (120–180 words)

<!-- Answer all three in your own words, without the assistant:
     (a) Which mistake in the FIRST suite would have let a wrong canBook pass, and how did you find it?
     (b) What does your final green run prove, and what does it NOT prove? Use a mutant or a UI check.
     (c) One testing limitation that remains.
     Worthless: "The AI wrote good tests and they all passed."
     Worth everything: "The first suite expected T06 (exactly 120 minutes) to be rejected. That
     contradicts AC2, and it failed on a correct canBook. If I had changed the code to make it
     pass, M1 would have become the real behaviour." -->

<!-- Write your conclusion below this line -->
